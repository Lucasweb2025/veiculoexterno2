/**
 * GPS, permissões nativas e recuperação de sinal — etapa 7.
 */
function configurarMonitoramentoSegundoPlano() {
    if (monitorSegundoPlanoOk) return;
    monitorSegundoPlanoOk = true;
    document.addEventListener('visibilitychange', function () {
        if (!running) return;
        if (document.hidden) {
            salvarBackupViagem();
            atualizarBannerSegundoPlano(true);
        } else {
            atualizarBannerSegundoPlano(false);
            reativarWakeLock();
            retomarGpsAposDesbloqueio();
        }
    });
    window.addEventListener('pagehide', function () {
        if (running) salvarBackupViagem();
    });
}

function atualizarBannerSegundoPlano(emSegundoPlano) {
    const b = document.getElementById('corrida-status-banner');
    if (!b) return;
    const bgAtivo = appEhNativo() && bgWatcherId != null;
    if (emSegundoPlano) {
        b.classList.add('aviso-plano');
        b.innerHTML = bgAtivo
            ? '<strong>Tela bloqueada</strong> — GPS continua em segundo plano. Veja a notificação "Corrida em andamento".'
            : '<strong>Tela bloqueada</strong> — o GPS pode pausar. Ao desbloquear, aguarde o sinal. Km já rodados ficam salvos no aparelho.';
    } else {
        b.classList.remove('aviso-plano');
        b.innerHTML = bgAtivo
            ? '<strong>Corrida ativa</strong> — GPS em segundo plano ligado. Pode bloquear a tela se precisar.'
            : '<strong>Corrida ativa</strong> — linha azul = onde você já passou. Use Google Maps para navegar.';
    }
}

async function reativarWakeLock() {
    if (!running || !('wakeLock' in navigator)) return;
    try {
        if (wakeLock) { try { wakeLock.release(); } catch (e) {} }
        wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) { /* alguns celulares não permitem com tela apagada */ }
}

function retomarGpsAposDesbloqueio() {
    if (!running) return;
    if (appEhNativo() && bgWatcherId != null) {
        const el = document.getElementById('gps-status');
        if (el) el.textContent = 'GPS ativo (segundo plano)';
        atualizarBannerSegundoPlano(false);
        return;
    }
    retomarGpsAposPerdaSinal(fleet[idx].id, 'tela bloqueada');
}

function iniciarMonitorRecuperacaoGps(carId) {
    pararMonitorRecuperacaoGps();
    gpsRecoveryInterval = setInterval(function () {
        verificarRecuperacaoGps(carId);
    }, GPS_RECOVERY_POLL_MS);
}

function pararMonitorRecuperacaoGps() {
    if (gpsRecoveryInterval) {
        clearInterval(gpsRecoveryInterval);
        gpsRecoveryInterval = null;
    }
    gpsSemSinal = false;
}

function atualizarBannerSemSinalGps(semSinal) {
    const b = document.getElementById('corrida-status-banner');
    if (!b || !running || document.hidden) return;
    const bgAtivo = appEhNativo() && bgWatcherId != null;
    if (semSinal) {
        b.classList.add('aviso-plano');
        b.innerHTML = '<strong>Sem sinal GPS</strong> — túnel ou prédio. Ao sair, aguarde; o app tenta retomar sozinho.';
    } else {
        b.classList.remove('aviso-plano');
        b.innerHTML = bgAtivo
            ? '<strong>Corrida ativa</strong> — GPS em segundo plano ligado. Pode bloquear a tela se precisar.'
            : '<strong>Corrida ativa</strong> — linha azul = onde você já passou. Use Google Maps para navegar.';
    }
}

function verificarRecuperacaoGps(carId) {
    if (!running || !navigator.geolocation) return;
    const agora = Date.now();
    const tevePonto = lastGpsAt > 0 || path.length > 0;
    if (!tevePonto) return;
    const desdeUltimo = lastGpsAt > 0 ? agora - lastGpsAt : agora - startTime;
    if (desdeUltimo <= GPS_STALE_MS) {
        if (gpsSemSinal) {
            gpsSemSinal = false;
            atualizarBannerSemSinalGps(false);
        }
        return;
    }
    gpsSemSinal = true;
    atualizarBannerSemSinalGps(true);
    if (agora - gpsLastRecoveryAt < GPS_RECOVERY_COOLDOWN_MS) return;
    gpsLastRecoveryAt = agora;
    retomarGpsAposPerdaSinal(carId, 'perda de sinal');
}

function retomarGpsAposPerdaSinal(carId, motivo) {
    if (!running) return;
    if (appEhNativo() && bgWatcherId != null) {
        if (motivo === 'tela bloqueada') return;
        const el = document.getElementById('gps-status');
        if (el) el.textContent = 'Aguardando sinal GPS...';
        navigator.geolocation.getCurrentPosition(
            function (p) { onPosicaoGps(carId, p); },
            function () { /* timeout no túnel — próxima tentativa no poll */ },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
        );
        return;
    }
    const el = document.getElementById('gps-status');
    const msg = motivo === 'tela bloqueada'
        ? 'Retomando GPS após tela bloqueada...'
        : 'Retomando GPS após perda de sinal...';
    if (el) el.textContent = msg;
    atualizarGpsUi(99, 'warn');
    iniciarWatchGps(carId);
    navigator.geolocation.getCurrentPosition(
        function (p) { onPosicaoGps(carId, p); },
        function () { /* timeout no túnel — próxima tentativa no poll */ },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
}

function atualizarGpsUi(acc, modo) {
    const el = document.getElementById('gps-status');
    const dot = document.getElementById('gps-dot');
    if (dot) dot.className = 'gps-dot ' + modo;
    if (!el) return;
    const m = Math.round(acc);
    if (modo === 'ok') el.textContent = 'GPS excelente (~' + m + ' m)';
    else if (modo === 'warn') el.textContent = 'GPS bom (~' + m + ' m)';
    else if (modo === 'bad') el.textContent = 'GPS fraco — aguarde';
    else el.textContent = 'Aguardando GPS...';
}

function seguirCarro(pos) {
    if (!map || !mapFollowCar || !running) return;
    const z = map.getZoom() < 15 ? 17 : map.getZoom();
    map.setView(pos, z, { animate: true, duration: 0.35 });
}

function appEhNativo() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function obterPluginBackgroundGeo() {
    if (!appEhNativo() || !window.Capacitor) return null;
    if (window.Capacitor.Plugins && window.Capacitor.Plugins.BackgroundGeolocation) {
        return window.Capacitor.Plugins.BackgroundGeolocation;
    }
    if (window.Capacitor.registerPlugin) {
        return window.Capacitor.registerPlugin('BackgroundGeolocation');
    }
    return null;
}

function obterPluginGeolocation() {
    if (!appEhNativo() || !window.Capacitor) return null;
    if (window.Capacitor.Plugins && window.Capacitor.Plugins.Geolocation) {
        return window.Capacitor.Plugins.Geolocation;
    }
    if (window.Capacitor.registerPlugin) {
        return window.Capacitor.registerPlugin('Geolocation');
    }
    return null;
}

function permissaoLocalizacaoOk(status) {
    if (!status) return false;
    return status.location === 'granted' || status.coarseLocation === 'granted';
}

function locationPluginParaPosicaoGps(loc) {
    return {
        coords: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy != null ? loc.accuracy : 99
        }
    };
}

async function pararWatchBackground() {
    const BG = obterPluginBackgroundGeo();
    if (!BG || bgWatcherId == null) return;
    try {
        await BG.removeWatcher({ id: bgWatcherId });
    } catch (e) { /* watcher já removido */ }
    bgWatcherId = null;
}

async function solicitarPermissaoLocalizacaoNativa() {
    const geo = obterPluginGeolocation();
    if (!geo) return false;
    try {
        if (geo.checkPermissions) {
            const atual = await geo.checkPermissions();
            if (permissaoLocalizacaoOk(atual)) return true;
        }
        if (geo.requestPermissions) {
            const res = await geo.requestPermissions();
            return permissaoLocalizacaoOk(res);
        }
    } catch (e) {
        console.warn('Permissão nativa de localização', e);
    }
    return false;
}

function obterPosicaoGpsPromessa(opcoes) {
    const opts = opcoes || { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 };
    const geo = obterPluginGeolocation();
    if (appEhNativo() && geo && geo.getCurrentPosition) {
        return geo.getCurrentPosition(opts).then(function (pos) {
            return {
                coords: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy != null ? pos.coords.accuracy : 99
                }
            };
        });
    }
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });
}

function solicitarPermissaoLocalizacao() {
    return new Promise(async (resolve, reject) => {
        if (!navigator.geolocation && !obterPluginGeolocation()) {
            reject(new Error('no_geo'));
            return;
        }
        try {
            if (appEhNativo()) await solicitarPermissaoLocalizacaoNativa();
        } catch (e) { /* segue */ }
        try {
            await obterPosicaoGpsPromessa({ enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

async function centralizarNaMinhaPosicao() {
    if (!map || !navigator.geolocation) {
        return alert('GPS não disponível neste aparelho.');
    }
    const btn = document.getElementById('btn-minha-posicao');
    if (btn) btn.disabled = true;
    try {
        if (appEhNativo()) await solicitarPermissaoLocalizacaoNativa();
        const p = await obterPosicaoGpsPromessa({ enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
        const pos = [p.coords.latitude, p.coords.longitude];
        if (marker) marker.setLatLng(pos);
        const zoom = map.getZoom() < 16 ? 17 : map.getZoom();
        map.setView(pos, zoom, { animate: true, duration: 0.4 });
        if (running) {
            mapFollowCar = true;
            const btnRota = document.getElementById('btn-ver-rota');
            if (btnRota) btnRota.textContent = 'Trajeto';
        }
    } catch (e) {
        const dica = appEhNativo()
            ? 'Ative GPS e permissão em Configurações → Apps → L.A. Controle → Localização → "Permitir o tempo todo".'
            : 'Ative o GPS e permita localização para este site.';
        alert('Não foi possível achar sua posição.\n\n' + dica);
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function aquecerGpsNoMapa() {
    try {
        if (appEhNativo()) await solicitarPermissaoLocalizacaoNativa();
        const p = await obterPosicaoGpsPromessa({ enableHighAccuracy: true, maximumAge: 5000, timeout: 25000 });
        const pos = [p.coords.latitude, p.coords.longitude];
        if (marker) marker.setLatLng(pos);
        atualizarGpsUi(p.coords.accuracy, p.coords.accuracy <= 25 ? 'ok' : 'warn');
        if (map && !running) map.setView(pos, Math.max(map.getZoom(), 16), { animate: true });
    } catch (e) {
        atualizarGpsUi(999, 'wait');
    }
}

function publicarPosicaoAtualNoFirebase(carId, pos) {
    laDb().ref('vehicles/' + carId + '/last_pos').set({
        lat: pos[0],
        lng: pos[1],
        driver: driver,
        km_atual: (dist / 1000).toFixed(2),
        last_update: new Date().toLocaleString('pt-BR')
    });
}

function processarPrimeiroPontoGps(pos) {
    lastGpsAt = Date.now();
    path.push(pos);
    polyline.addLatLng(pos);
    marker.setLatLng(pos);
    atualizarLinhaSaidaDaBase();
    map.setView(pos, 17);
}

function processarPontoGpsContinuo(pos) {
    const last = path[path.length - 1];
    const d = L.latLng(last).distanceTo(pos);
    if (d < 3 || d > 120) return false;

    dist += d;
    path.push(pos);
    marker.setLatLng(pos);
    polyline.addLatLng(pos);

    if (path.length === 2) {
        atualizarLinhaSaidaDaBase();
        renderizarUnidadesNoMapa();
    }

    seguirCarro(pos);
    if (typeof atualizarKmDisplay === 'function') atualizarKmDisplay();
    if (typeof atualizarTrajetoAoVivoNasRuas === 'function') atualizarTrajetoAoVivoNasRuas();
    return true;
}

function tratarErroGps(err) {
    atualizarGpsUi(999, 'bad');
    if (err.code === 1) alert('Ative a localização nas configurações.');
    else if (err.code === 2) alert('GPS indisponível.');
}

function onPosicaoGps(carId, p) {
    const acc = p.coords.accuracy;
    const pos = [p.coords.latitude, p.coords.longitude];
    const limiteAcc = path.length === 0 ? GPS_ACCURACY_LIMIT_FIRST : GPS_ACCURACY_LIMIT;
    if (acc > limiteAcc) {
        atualizarGpsUi(acc, 'bad');
        return;
    }

    atualizarGpsUi(acc, acc <= 25 ? 'ok' : 'warn');

    if (path.length === 0) {
        processarPrimeiroPontoGps(pos);
        return;
    }

    const aceito = processarPontoGpsContinuo(pos);
    if (!aceito) return;
    lastGpsAt = Date.now();
    if (gpsSemSinal) {
        gpsSemSinal = false;
        atualizarBannerSemSinalGps(false);
    }
    salvarBackupViagem();
    publicarPosicaoAtualNoFirebase(carId, pos);
}

function iniciarWatchGpsPadrao(carId) {
    if (watch) {
        navigator.geolocation.clearWatch(watch);
        watch = null;
    }
    watch = navigator.geolocation.watchPosition(
        function (p) { onPosicaoGps(carId, p); },
        function (err) { tratarErroGps(err); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );
}

async function iniciarWatchGps(carId) {
    if (watch) {
        navigator.geolocation.clearWatch(watch);
        watch = null;
    }
    await pararWatchBackground();

    if (appEhNativo()) {
        await solicitarPermissaoLocalizacaoNativa();
    }

    const BG = obterPluginBackgroundGeo();
    if (BG) {
        let bgSemPermissao = false;
        try {
            bgWatcherId = await BG.addWatcher(
                {
                    backgroundMessage: 'Toque para voltar ao app. A corrida continua sendo rastreada.',
                    backgroundTitle: 'Corrida em andamento',
                    requestPermissions: true,
                    stale: false,
                    distanceFilter: 0
                },
                function (location, error) {
                    if (error) {
                        if (error.code === 'NOT_AUTHORIZED' && !bgSemPermissao) {
                            bgSemPermissao = true;
                            pararWatchBackground().then(function () {
                                iniciarWatchGpsPadrao(carId);
                            });
                        }
                        return;
                    }
                    if (!location || !running) return;
                    onPosicaoGps(carId, locationPluginParaPosicaoGps(location));
                }
            );
            return;
        } catch (e) {
            bgWatcherId = null;
            console.warn('Background GPS indisponível, usando GPS padrão.', e);
        }
    }

    iniciarWatchGpsPadrao(carId);
}
