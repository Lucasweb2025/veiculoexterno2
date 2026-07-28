/**
 * Mapa Leaflet, unidades e preview de rota — motorista (etapa 6).
 */

function pathParaCoordsOrs(pontos) {
    return pontos.map(p => [p[1], p[0]]);
}

function coordsOrsParaPath(coords) {
    return coords.map(c => [c[1], c[0]]);
}

async function buscarGeometriaOrs(coords, opcoes) {
    const key = typeof laOrsKey === 'function' ? laOrsKey() : '';
    if (!key) return null;
    const body = { coordinates: coords };
    if (opcoes && opcoes.radiuses) body.radiuses = opcoes.radiuses;
    try {
        const res = await fetch(ORS_DIRECTIONS_URL, {
            method: 'POST',
            headers: { Authorization: key, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.features || !data.features[0]) return null;
        return data.features[0].geometry.coordinates;
    } catch (e) {
        return null;
    }
}

function limparRotaPlanejada() {
    if (polylinePlanejada && map) {
        map.removeLayer(polylinePlanejada);
        polylinePlanejada = null;
    }
    if (linhaDestino && map) {
        map.removeLayer(linhaDestino);
        linhaDestino = null;
    }
}

function limparPreviewRota() {
    limparRotaPlanejada();
    if (linhaDestino && map) {
        map.removeLayer(linhaDestino);
        linhaDestino = null;
    }
}

async function atualizarPreviewRotaDestino() {
    limparPreviewRota();
    if (!map || running) return;
    if (!destinoSelecionado || destinoSelecionado.lat == null) return;

    const dest = destinoSelecionado;

    function desenharLinhaReferencia(origemLat, origemLng) {
        const pts = [[origemLat, origemLng], [dest.lat, dest.lng]];
        linhaDestino = L.polyline(pts, {
            color: ROUTE_PLANNED_COLOR,
            weight: 5,
            dashArray: '12, 10',
            opacity: 0.8,
            lineCap: 'round'
        }).addTo(map);
        map.fitBounds(L.latLngBounds(pts), { padding: [80, 80], maxZoom: 16, animate: true });
    }

    function desenharRotaOrs(pts) {
        polylinePlanejada = L.polyline(pts, {
            color: ROUTE_PLANNED_COLOR,
            weight: 6,
            opacity: 0.88,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(map);
        map.fitBounds(L.latLngBounds(pts), { padding: [80, 80], maxZoom: 16, animate: true });
    }

    const lerPosicaoAtual = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(); return; }
        navigator.geolocation.getCurrentPosition(
            p => resolve([p.coords.latitude, p.coords.longitude]),
            () => reject(),
            { enableHighAccuracy: true, maximumAge: 45000, timeout: 12000 }
        );
    });

    try {
        const pos = await lerPosicaoAtual();
        const lat = pos[0];
        const lng = pos[1];
        const geometria = await buscarGeometriaOrs([[lng, lat], [dest.lng, dest.lat]]);
        if (geometria) {
            desenharRotaOrs(coordsOrsParaPath(geometria));
            return;
        }
        desenharLinhaReferencia(lat, lng);
        return;
    } catch (e) { /* sem GPS */ }

    const base = unidadesLista.find(u => u.matriz);
    if (base) desenharLinhaReferencia(base.lat, base.lng);
}

function atualizarLinhaDestino() {
    atualizarPreviewRotaDestino();
}

function ajustarZoomParaDestino() {
    if (!map) return;
    const pts = [];
    const base = unidadesLista.find(u => u.matriz);
    if (base) pts.push([base.lat, base.lng]);
    if (destinoSelecionado && destinoSelecionado.lat != null) {
        pts.push([destinoSelecionado.lat, destinoSelecionado.lng]);
    }
    if (path.length) path.forEach(p => pts.push(p));
    if (pts.length === 0) return;
    if (pts.length === 1) map.setView(pts[0], 16);
    else map.fitBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 16, animate: true });
}

function mesclarParadasRotaFixa(lista) {
    const ids = new Set(lista.map(u => u.id));
    UNIDADES_LA.filter(u => u.paradaRota).forEach(u => {
        if (!ids.has(u.id)) lista.push(Object.assign({}, u));
    });
    return lista;
}

function carregarUnidadesFirebase() {
    const db = laDb();
    return new Promise(resolve => {
        db.ref('unidades').once('value', snap => {
            const val = snap.val();
            if (!val) { resolve(UNIDADES_LA.slice()); return; }
            const lista = Object.entries(val).map(([id, u]) => ({
                id,
                nome: u.nome || id,
                nomeCurto: u.nomeCurto || u.nome || id,
                endereco: u.endereco || '',
                lat: parseFloat(u.lat),
                lng: parseFloat(u.lng),
                matriz: !!u.matriz,
                paradaRota: !!u.paradaRota,
                ordemRota: u.ordemRota != null ? parseInt(u.ordemRota, 10) : undefined
            })).filter(u => !isNaN(u.lat) && !isNaN(u.lng));
            resolve(mesclarParadasRotaFixa(lista.length ? lista : UNIDADES_LA.slice()));
        }, () => resolve(UNIDADES_LA.slice()));
    });
}

function deveExibirUnidadeNoMapa(u, selId) {
    if (destinoSelecionado && destinoSelecionado.id === 'outros' && destinoSelecionado.lat == null) return !!u.matriz;
    if (destinoSelecionado && destinoSelecionado.id === 'outros' && destinoSelecionado.lat != null) return !!u.matriz;
    if (destinoSelecionado && destinoSelecionado.id === 'sede') return !!u.matriz;
    if (u.matriz) return true;
    if (!u.paradaRota) return false;
    if (destinoSelecionado) return selId === u.id;
    return true;
}

function renderizarUnidadesNoMapa() {
    if (!map) return;
    if (unidadesLayer) map.removeLayer(unidadesLayer);
    unidadesLayer = L.layerGroup();
    const selId = destinoSelecionado ? destinoSelecionado.id : null;
    unidadesLista.forEach(u => {
        if (!deveExibirUnidadeNoMapa(u, selId)) return;
        const isParada = !!u.paradaRota;
        const selecionado = selId === u.id || (selId === 'sede' && u.matriz);
        const isBase = !!u.matriz;
        const balaoFixo = isBase || selecionado;
        const sz = isBase ? 18 : (selecionado ? 18 : 12);
        const icon = L.divIcon({
            className: 'unidade-marker-wrap',
            html: '<div class="unidade-marker' + (isBase ? ' matriz' : '') + (isParada ? ' parada-rota' : '') + (selecionado ? ' selecionado' : '') + '"></div>',
            iconSize: [sz, sz],
            iconAnchor: [sz / 2, sz / 2]
        });
        const tipHtml = '<div class="unidade-tip"><b>' + u.nome + '</b><span>' + u.endereco + '</span></div>';
        const m = L.marker([u.lat, u.lng], { icon: icon, zIndexOffset: selecionado || isBase ? 500 : 400 });
        if (balaoFixo) {
            m.bindTooltip(tipHtml, { permanent: true, direction: 'top', offset: [0, -12], className: 'unidade-tooltip' });
        } else {
            m.bindTooltip(tipHtml, { direction: 'top', offset: [0, -10], className: 'unidade-tooltip' });
        }
        if (isParada && !running) m.on('click', () => selecionarDestino(u.id));
        m.addTo(unidadesLayer);
    });
    unidadesLayer.addTo(map);
    atualizarMarcadorDestinoCustom();
    atualizarLinhaDestino();
}

function atualizarMarcadorDestinoCustom() {
    if (!map) return;
    if (marcadorDestinoCustom) {
        map.removeLayer(marcadorDestinoCustom);
        marcadorDestinoCustom = null;
    }
    if (!destinoSelecionado || destinoSelecionado.lat == null) return;
    if (destinoSelecionado.id !== 'outros') return;
    const icon = L.divIcon({
        className: 'unidade-marker-wrap',
        html: '<div class="unidade-marker parada-rota selecionado"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
    const tip = '<div class="unidade-tip"><b>' + escHtml(destinoSelecionado.nomeCurto || destinoSelecionado.nome) + '</b><span>' + escHtml(destinoSelecionado.endereco || '') + '</span></div>';
    marcadorDestinoCustom = L.marker([destinoSelecionado.lat, destinoSelecionado.lng], { icon: icon, zIndexOffset: 600 })
        .bindTooltip(tip, { permanent: true, direction: 'top', offset: [0, -12], className: 'unidade-tooltip' })
        .addTo(map);
}

function atualizarLinhaSaidaDaBase() {
    if (!map) return;
    if (linhaSaidaBase) { map.removeLayer(linhaSaidaBase); linhaSaidaBase = null; }
    const base = unidadesLista.find(u => u.matriz) || unidadesLista[0];
    if (!base || path.length === 0) return;
    const d = L.latLng(path[0]).distanceTo([base.lat, base.lng]);
    if (d > 60) {
        linhaSaidaBase = L.polyline([[base.lat, base.lng], path[0]], {
            color: ROUTE_COLOR,
            weight: 5,
            dashArray: '12, 10',
            opacity: 0.65,
            lineCap: 'round'
        }).addTo(map);
    }
}

function ajustarZoomMapaComUnidades() {
    if (!map) return;
    const pts = [];
    const selId = destinoSelecionado ? destinoSelecionado.id : null;
    unidadesLista.forEach(u => {
        if (deveExibirUnidadeNoMapa(u, selId)) pts.push([u.lat, u.lng]);
    });
    if (path.length) path.forEach(p => pts.push(p));
    if (pts.length === 1) {
        map.setView(pts[0], 16);
        return;
    }
    if (pts.length > 1) {
        map.fitBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 16, animate: true });
    }
}

async function initOperation() {
    if (!driver) return alert('Selecione o motorista primeiro.');
    if (typeof atualizarBarraViagem === 'function') atualizarBarraViagem();
    proximaTela('tela-veiculo', 'tela-mapa');
    mapFollowCar = true;
    unidadesLista = await carregarUnidadesFirebase();
    const base = unidadesLista.find(u => u.matriz) || unidadesLista[0];
    const centro = base ? [base.lat, base.lng] : [-23.612783, -46.665663];
    const pin = L.divIcon({ className: 'car-pin-wrap', html: '<div class="car-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
    const destinoAntes = destinoSelecionado;
    if (map) { map.remove(); map = null; }
    linhaSaidaBase = null;
    linhaDestino = null;
    limparRotaPlanejada();
    destinoSelecionado = destinoAntes;
    if (!destinoSelecionado) restaurarUltimoDestino();
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView(centro, 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
    marker = L.marker(centro, { icon: pin, zIndexOffset: 1000 }).addTo(map);
    polyline = L.polyline([], { color: ROUTE_COLOR, weight: 7, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    renderizarUnidadesNoMapa();
    renderizarBarraEnderecos();
    if (typeof atualizarBarraViagem === 'function') atualizarBarraViagem();
    atualizarLabelDestinoSheet();
    atualizarBotoesNavegacao();
    const motivoSel = document.getElementById('motivo-corrida-select');
    if (motivoSel && !running) motivoSel.value = '';
    if (typeof onChangeMotivoCorrida === 'function') onChangeMotivoCorrida();
    if (typeof resetarEstadoVeiculo === 'function') resetarEstadoVeiculo();
    if (typeof renderizarTiposProblemaVeiculo === 'function') renderizarTiposProblemaVeiculo();
    if (destinoSelecionado) {
        atualizarLinhaDestino();
        ajustarZoomParaDestino();
    } else {
        setTimeout(function () { map.invalidateSize(); ajustarZoomMapaComUnidades(); }, 300);
    }
    setTimeout(function () { map.invalidateSize(); }, 800);
    if (typeof aquecerGpsNoMapa === 'function') aquecerGpsNoMapa();
}

function alternarModoMapa() {
    mapFollowCar = !mapFollowCar;
    const btn = document.getElementById('btn-ver-rota');
    if (!btn) return;
    btn.textContent = mapFollowCar ? 'Trajeto' : 'Seguir';
    if (mapFollowCar && path.length && typeof seguirCarro === 'function') seguirCarro(path[path.length - 1]);
    else ajustarZoomMapaComUnidades();
}
