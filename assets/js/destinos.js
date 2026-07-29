/**
 * Seleção de destinos — motorista (etapa 6).
 * Depende de: state.js, constants.js, mapa.js (renderização no mapa).
 */

function carregarDestinosRecentes() {
    try {
        const raw = localStorage.getItem(RECENT_DESTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
}

function salvarDestinoRecente(dest) {
    if (!dest || running) return;
    let lista = carregarDestinosRecentes();
    const entry = (dest.id === 'outros')
        ? { tipo: 'custom', id: 'outros', nome: dest.nomeCurto || dest.nome, endereco: dest.endereco || dest.nome, lat: dest.lat, lng: dest.lng }
        : { tipo: 'fixo', id: dest.id };
    lista = lista.filter(function (x) {
        if (entry.tipo === 'custom' && x.tipo === 'custom') {
            return (x.endereco || x.nome) !== (entry.endereco || entry.nome);
        }
        return !(x.tipo === 'fixo' && x.id === entry.id);
    });
    lista.unshift(entry);
    if (lista.length > RECENT_DESTS_MAX) lista = lista.slice(0, RECENT_DESTS_MAX);
    try { localStorage.setItem(RECENT_DESTS_KEY, JSON.stringify(lista)); } catch (e) { /* quota */ }
}

function renderizarDestinosRecentes() {
    const wrap = document.getElementById('destino-recentes');
    const chips = document.getElementById('destino-recentes-chips');
    if (!wrap || !chips) return;
    const lista = carregarDestinosRecentes();
    if (!lista.length || running || (destinoSelecionado && !modoOutrosAberto)) {
        wrap.hidden = true;
        chips.innerHTML = '';
        return;
    }
    wrap.hidden = false;
    chips.innerHTML = lista.map(function (entry, i) {
        const nome = entry.tipo === 'custom'
            ? (entry.nome || entry.endereco || 'Endereço')
            : (function () {
                const d = resolverDestinoPorId(entry.id);
                return d ? (d.nomeCurto || d.nome) : entry.id;
            })();
        const tit = entry.tipo === 'custom' ? (entry.endereco || nome) : nome;
        return '<button type="button" class="destino-recente-chip" title="' + escHtmlAttr(tit) + '" onclick="aplicarDestinoRecente(' + i + ')">' + escHtml(nome) + '</button>';
    }).join('');
}

function aplicarDestinoRecente(indice) {
    if (running) return;
    const lista = carregarDestinosRecentes();
    const entry = lista[indice];
    if (!entry) return;
    modoOutrosAberto = false;
    if (entry.tipo === 'custom') {
        destinoSelecionado = {
            id: 'outros',
            nome: entry.endereco || entry.nome,
            nomeCurto: entry.nome || entry.endereco,
            endereco: entry.endereco || entry.nome,
            lat: entry.lat,
            lng: entry.lng
        };
    } else {
        destinoSelecionado = resolverDestinoPorId(entry.id);
    }
    if (!destinoSelecionado) return;
    finalizarSelecaoDestino();
}

function finalizarSelecaoDestino() {
    salvarDestinoRecente(destinoSelecionado);
    modoOutrosAberto = false;
    const formOutros = document.getElementById('destino-outros-form');
    if (formOutros) formOutros.hidden = true;
    renderizarPickerDestino();
    if (typeof atualizarBarraViagem === 'function') atualizarBarraViagem();
    renderizarUnidadesNoMapa();
    atualizarPreviewRotaDestino();
    ajustarZoomParaDestino();
}

function renderizarPickerDestino() {
    const picker = document.getElementById('destino-picker');
    const chips = document.getElementById('destino-chips');
    const nomeEl = document.getElementById('destino-selecionado-nome');
    const endEl = document.getElementById('destino-selecionado-end');
    const formOutros = document.getElementById('destino-outros-form');
    if (!picker) return;
    const selId = destinoSelecionado ? destinoSelecionado.id : '';
    const dis = running ? ' disabled' : '';

    picker.classList.toggle('modo-outros', modoOutrosAberto && !running);

    if (destinoSelecionado && !running && !modoOutrosAberto) {
        picker.classList.add('tem-selecionado');
        const nome = destinoSelecionado.nomeCurto || destinoSelecionado.nome;
        if (nomeEl) nomeEl.textContent = nome;
        if (endEl) {
            if (destinoSelecionado.endereco) endEl.textContent = destinoSelecionado.endereco;
            else endEl.textContent = '';
        }
        if (formOutros) formOutros.hidden = true;
        renderizarDestinosRecentes();
        atualizarLabelDestinoSheet();
        atualizarPreCorridaResumo();
        return;
    }

    picker.classList.remove('tem-selecionado');
    const destinos = unidadesLista.filter(u => u.paradaRota);

    if (chips) {
        const chipHtml = destinos.map(d => {
            const nome = d.nomeCurto || d.nome;
            const on = selId === d.id ? ' on' : '';
            const end = (d.endereco || nome).replace(/"/g, '&quot;');
            return '<button type="button" class="destino-chip' + on + '"' + dis + ' onclick="selecionarDestino(\'' + d.id + '\')" title="' + end + '">' + nome + '</button>';
        }).join('') +
            '<button type="button" class="destino-chip sede' + (selId === 'sede' ? ' on' : '') + '"' + dis + ' onclick="selecionarDestino(\'sede\')" title="L.A. Moema">Sede</button>' +
            '<button type="button" class="destino-chip outros' + (modoOutrosAberto ? ' on' : '') + '"' + dis + ' onclick="selecionarDestino(\'outros\')" title="Digite o endereço">Outros</button>';
        chips.innerHTML = chipHtml;
    }

    if (formOutros) formOutros.hidden = !modoOutrosAberto;
    renderizarDestinosRecentes();
    atualizarLabelDestinoSheet();
    atualizarPreCorridaResumo();
}

function confirmarEnderecoOutros() {
    if (running) return false;
    const inp = document.getElementById('destino-outros-input');
    const err = document.getElementById('destino-outros-erro');
    const texto = (inp && inp.value || '').trim();
    if (!texto) {
        if (err) err.textContent = 'Digite o endereço para onde você vai.';
        return false;
    }
    if (err) err.textContent = '';
    const nomeCurto = texto.length > 36 ? texto.slice(0, 36) + '…' : texto;
    destinoSelecionado = {
        id: 'outros',
        nome: texto,
        nomeCurto: nomeCurto,
        endereco: texto
    };
    finalizarSelecaoDestino();
    return true;
}

function renderizarBarraEnderecos() {
    renderizarPickerDestino();
}

function trocarDestino() {
    if (running) return;
    destinoSelecionado = null;
    modoOutrosAberto = false;
    const err = document.getElementById('destino-outros-erro');
    if (err) err.textContent = '';
    renderizarPickerDestino();
    if (typeof atualizarBarraViagem === 'function') atualizarBarraViagem();
    renderizarUnidadesNoMapa();
    limparPreviewRota();
    ajustarZoomMapaComUnidades();
}

function atualizarLabelDestinoSheet() {
    const el = document.getElementById('destino-label-sheet');
    if (!el) return;
    if (!destinoSelecionado) el.textContent = modoOutrosAberto ? 'Digite o endereço' : '—';
    else if (destinoSelecionado.id === 'sede') el.textContent = 'Sede (Moema)';
    else if (destinoSelecionado.id === 'outros') el.textContent = destinoSelecionado.endereco || destinoSelecionado.nome;
    else el.textContent = destinoSelecionado.nomeCurto || destinoSelecionado.nome;
    atualizarBotoesNavegacao();
}

function atualizarBotoesNavegacao() {
    const nav = document.getElementById('sheet-navegar');
    if (!nav) return;
    const ok = destinoSelecionado && destinoSelecionado.lat != null;
    nav.style.display = ok ? 'flex' : 'none';
}

function abrirNavegacao(tipo) {
    if (!destinoSelecionado || destinoSelecionado.lat == null) {
        return alert('Escolha um destino com endereço no mapa antes de navegar.');
    }
    const dest = destinoSelecionado;
    const base = unidadesLista.find(u => u.matriz);
    let url;
    if (tipo === 'google') {
        let origem = '';
        if (running && path.length) {
            const p = path[path.length - 1];
            origem = 'origin=' + p[0] + ',' + p[1] + '&';
        } else {
            const irParaSede = destinoSelecionado.id === 'sede';
            origem = (!irParaSede && base) ? 'origin=' + base.lat + ',' + base.lng + '&' : '';
        }
        url = 'https://www.google.com/maps/dir/?api=1&' + origem +
            'destination=' + dest.lat + ',' + dest.lng + '&travelmode=driving';
    } else {
        const trecho = (running && path.length)
            ? path[path.length - 1][1] + ',' + path[path.length - 1][0] + ';' + dest.lng + ',' + dest.lat
            : (base
                ? base.lng + ',' + base.lat + ';' + dest.lng + ',' + dest.lat
                : dest.lng + ',' + dest.lat);
        url = 'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=' + trecho;
    }
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (mobile) window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
}

function resolverDestinoPorId(id) {
    if (!id) return null;
    if (id === 'sede') {
        const base = unidadesLista.find(u => u.matriz);
        return base
            ? Object.assign({}, base, { id: 'sede', nome: 'L.A. Moema — Sede', nomeCurto: 'Sede' })
            : null;
    }
    if (id === 'outros') return null;
    return unidadesLista.find(u => u.id === id) || null;
}

function restaurarUltimoDestino() {
    const recentes = carregarDestinosRecentes();
    if (recentes.length) {
        const entry = recentes[0];
        modoOutrosAberto = false;
        if (entry.tipo === 'custom') {
            destinoSelecionado = {
                id: 'outros',
                nome: entry.endereco || entry.nome,
                nomeCurto: entry.nome || entry.endereco,
                endereco: entry.endereco || entry.nome,
                lat: entry.lat,
                lng: entry.lng
            };
        } else {
            destinoSelecionado = resolverDestinoPorId(entry.id);
        }
        return !!destinoSelecionado;
    }
    try {
        const id = localStorage.getItem(LAST_DEST_KEY);
        const d = resolverDestinoPorId(id);
        if (d) {
            destinoSelecionado = d;
            return true;
        }
    } catch (e) { /* ignore */ }
    return false;
}

function selecionarDestino(id) {
    if (running) return;
    if (id === 'outros') {
        modoOutrosAberto = true;
        destinoSelecionado = null;
        const err = document.getElementById('destino-outros-erro');
        if (err) err.textContent = '';
        renderizarPickerDestino();
        if (typeof atualizarBarraViagem === 'function') atualizarBarraViagem();
        const inp = document.getElementById('destino-outros-input');
        if (inp) setTimeout(function () { inp.focus(); }, 150);
        return;
    }
    modoOutrosAberto = false;
    destinoSelecionado = resolverDestinoPorId(id);
    if (!destinoSelecionado) return;
    finalizarSelecaoDestino();
}

function atualizarPreCorridaResumo() {
    const thumb = document.getElementById('pre-corrida-thumb');
    const linha1 = document.getElementById('pre-corrida-linha1');
    const linha2 = document.getElementById('pre-corrida-linha2');
    if (!thumb || !linha1) return;
    thumb.src = fleet[idx].foto;
    linha1.textContent = driver + ' · ' + fleet[idx].nome;
    if (linha2) {
        if (destinoSelecionado) {
            const nome = destinoSelecionado.nomeCurto || destinoSelecionado.nome;
            linha2.textContent = 'Destino: ' + nome;
        } else if (modoOutrosAberto) {
            const inp = document.getElementById('destino-outros-input');
            const t = inp && inp.value.trim();
            linha2.textContent = t ? 'Destino: ' + t : 'Digite o endereço em Outros';
        } else {
            linha2.textContent = 'Escolha o destino para iniciar';
        }
    }
}
