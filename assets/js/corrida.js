/**
 * Ciclo da corrida: iniciar, rastrear, finalizar — etapa 7.
 */
function atualizarKmDisplay() {
    const km = (dist / 1000).toFixed(2).replace('.', ',');
    const el = document.getElementById('km');
    const big = document.getElementById('km-big');
    if (el) el.textContent = km;
    if (big) big.textContent = km;
}

function setModoCorridaAtiva(ativo) {
    const tela = document.getElementById('tela-mapa');
    if (tela) tela.classList.toggle('corrida-ativa', ativo);
    if (map) setTimeout(function () { map.invalidateSize(); }, 400);
}

function validarInicioCorrida() {
    if (modoOutrosAberto && !confirmarEnderecoOutros()) {
        return 'Digite o endereço em Outros.';
    }
    if (!destinoSelecionado) return 'Escolha para onde você vai.';
    if (!estadoVeiculo) return 'Toque em "OK" ou reporte um problema no veículo.';
    if (estadoVeiculo === 'form') return 'Envie o alerta ou cancele o relatório de problema.';
    if (veiculoBloqueiaCorrida()) return 'Veículo marcado como não utilizável. Avise o gestor.';
    return '';
}

function configurarBotaoAguardandoGps(btn) {
    btn.disabled = true;
    btn.innerText = 'Aguardando GPS...';
}

function resetarBotaoIniciar(btn) {
    btn.disabled = false;
    btn.innerText = 'Iniciar corrida';
    btn.className = 'btn-yellow';
}

function configurarUiCorridaAtiva(btn) {
    btn.disabled = false;
    btn.innerText = 'Finalizar corrida';
    btn.className = 'btn-yellow stop';
    setModoCorridaAtiva(true);
    renderizarBarraEnderecos();
    renderizarUnidadesNoMapa();
    atualizarBotoesNavegacao();
    atualizarKmDisplay();
    mapFollowCar = true;
    atualizarGpsUi(99, 'wait');
    const btnRota = document.getElementById('btn-ver-rota');
    if (btnRota) {
        btnRota.style.display = 'block';
        btnRota.textContent = 'Trajeto';
    }
}

async function garantirPermissaoLocalizacao(btn) {
    try {
        await solicitarPermissaoLocalizacao();
        return true;
    } catch (err) {
        resetarBotaoIniciar(btn);
        if (err && err.code === 1) {
            const dica = appEhNativo()
                ? 'Configurações → Apps → L.A. Controle → Permissões → Localização → "Permitir o tempo todo".'
                : 'Configurações do celular → este site → Localização.';
            alert('Permita a localização para iniciar a corrida.\n\n' + dica);
        } else {
            alert('Não foi possível obter GPS. Tente de novo ao ar livre.');
        }
        return false;
    }
}

function iniciarTimersCorrida() {
    checkInterval = setInterval(function () {
        const hrs = Math.floor((Date.now() - startTime) / 3600000);
        if (hrs > 0 && hrs % CHECK_HOURS === 0 && hrs !== ultimoAlertaHorasCorrida) {
            ultimoAlertaHorasCorrida = hrs;
            if (confirm('Corrida ativa há ' + hrs + 'h!\nFinalizar agora?')) fecharCorrida();
        }
    }, 60000);

    timer = setInterval(function () {
        document.getElementById('tempo').innerText = formatarTempo(Date.now() - startTime);
        salvarBackupViagem();
    }, 1000);
}

async function iniciarCorrida(carId, btn) {
    configurarBotaoAguardandoGps(btn);
    const ok = await garantirPermissaoLocalizacao(btn);
    if (!ok) return;

    await reativarWakeLock();
    running = true;
    lastGpsAt = 0;
    ultimoSnapAoVivo = 0;
    ultimoAlertaHorasCorrida = 0;
    path = [];
    dist = 0;
    if (polyline) polyline.setLatLngs([]);
    startTime = Date.now();

    configurarUiCorridaAtiva(btn);
    laSetVehicleStatus(carId, 'EM MOVIMENTO');
    window.addEventListener('beforeunload', alertaFechar);
    // Verde (rota ORS) só na pré-corrida — na corrida fica só a azul (trajeto GPS) + pin do destino
    limparRotaPlanejada();
    if (typeof atualizarMarcadorDestinoCustom === 'function') atualizarMarcadorDestinoCustom();
    iniciarTimersCorrida();
    await iniciarWatchGps(carId);
    iniciarMonitorRecuperacaoGps(carId);
}

async function toggleTracking() {
    const btn = document.getElementById('btn-master');
    const carId = fleet[idx].id;

    if (!running) {
        const erroValidacao = validarInicioCorrida();
        if (erroValidacao) return alert(erroValidacao);
        await iniciarCorrida(carId, btn);
        return;
    }

    if (!confirm('Finalizar esta corrida?')) return;
    fecharCorrida();
}

function alertaFechar(e) {
    e.preventDefault();
    e.returnValue = '';
}

async function pararRastreio() {
    pararMonitorRecuperacaoGps();
    await pararWatchBackground();
    if (watch) { navigator.geolocation.clearWatch(watch); watch = null; }
    if (timer) { clearInterval(timer); timer = null; }
    if (checkInterval) { clearInterval(checkInterval); checkInterval = null; }
    if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
    window.removeEventListener('beforeunload', alertaFechar);
    limparRotaPlanejada();
    setModoCorridaAtiva(false);
}

function amostragemPath(pontos, max) {
    if (pontos.length <= max) return pontos;
    const result = [pontos[0]];
    const step = (pontos.length - 1) / (max - 1);
    for (let i = 1; i < max - 1; i++) result.push(pontos[Math.round(i * step)]);
    result.push(pontos[pontos.length - 1]);
    return result;
}

async function snapToRoad(rawPath, maxPontos) {
    if (rawPath.length < 2) return rawPath;
    const sampled = amostragemPath(rawPath, maxPontos || 50);
    const coords = pathParaCoordsOrs(sampled);
    const geometria = await buscarGeometriaOrs(coords, { radiuses: coords.map(function () { return 50; }) });
    return geometria ? coordsOrsParaPath(geometria) : rawPath;
}

function podeExecutarSnapAoVivo() {
    if (!running || snapAoVivoEmCurso || path.length < SNAP_MIN_PONTOS) return false;
    if (Date.now() - ultimoSnapAoVivo < SNAP_AO_VIVO_MS) return false;
    return true;
}

function aplicarSnapNaPolyline(snapped) {
    if (polyline && snapped.length >= 2) polyline.setLatLngs(snapped);
}

async function atualizarTrajetoAoVivoNasRuas() {
    if (!podeExecutarSnapAoVivo()) return;
    snapAoVivoEmCurso = true;
    try {
        const snapped = await snapToRoad(path, 40);
        aplicarSnapNaPolyline(snapped);
        ultimoSnapAoVivo = Date.now();
    } catch (e) { /* mantém linha GPS bruta */ }
    finally { snapAoVivoEmCurso = false; }
}

function calcularKmDoPath(pathData) {
    let km = 0;
    for (let i = 1; i < pathData.length; i++) {
        km += L.latLng(pathData[i - 1]).distanceTo(pathData[i]);
    }
    return parseFloat((km / 1000).toFixed(2));
}

function montarTripFinal(snappedPath, kmFinal) {
    return {
        car: fleet[idx].nome,
        driver: driver,
        km: kmFinal,
        time: document.getElementById('tempo').innerText,
        date: new Date().toLocaleString('pt-BR'),
        path: snappedPath,
        destino: destinoSelecionado ? (destinoSelecionado.nomeCurto || destinoSelecionado.nome) : '—',
        destinoId: destinoSelecionado ? destinoSelecionado.id : null,
        enderecoDestino: destinoSelecionado ? (destinoSelecionado.endereco || null) : null,
        motivoCorrida: getMotivoCorridaResolvido() || '—',
        problemaVeiculo: problemaVeiculoAtual ? {
            issueId: problemaVeiculoAtual.issueId || null,
            tipos: problemaVeiculoAtual.tipos || [],
            descricao: problemaVeiculoAtual.descricao || '',
            urgencia: problemaVeiculoAtual.urgencia || 'leve'
        } : null
    };
}

async function persistirTripFinal(carId, kmFinal, trip) {
    await laPersistirViagemFinal(carId, kmFinal, trip);
}

function restaurarBotaoFinalizar(btn) {
    btn.disabled = false;
    btn.innerText = 'Finalizar corrida';
    btn.className = 'btn-yellow stop';
}

function validarPathMinimoParaFinalizar() {
    return path.length >= 2;
}

async function fecharCorrida() {
    const btn = document.getElementById('btn-master');
    if (!validarPathMinimoParaFinalizar()) {
        return alert('Poucos pontos de GPS.\nAnde um pouco com a corrida ativa ou aguarde sinal melhor antes de finalizar.');
    }

    btn.disabled = true;
    btn.innerText = 'Ajustando rota...';
    const snappedPath = await snapToRoad(path);
    btn.innerText = 'Salvando...';

    const kmFinal = calcularKmDoPath(snappedPath);
    const carId = fleet[idx].id;
    const trip = montarTripFinal(snappedPath, kmFinal);

    try {
        await persistirTripFinal(carId, kmFinal, trip);
        await pararRastreio();
        running = false;
        localStorage.removeItem(TRIP_BACKUP_KEY);
        alert('Viagem finalizada!\n' + kmFinal + ' km');
        location.reload();
    } catch (e) {
        alert('Erro ao sincronizar. A corrida continua ativa — toque em Finalizar de novo.');
        restaurarBotaoFinalizar(btn);
    }
}
