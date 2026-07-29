/**
 * Constantes compartilhadas — app motorista.
 */
(function (global) {
    'use strict';

    global.ROUTE_COLOR = '#276EF1';
    global.ROUTE_PLANNED_COLOR = '#34A853';
    global.TRIP_BACKUP_KEY = 'la_trip_backup_v34';
    global.LAST_DEST_KEY = 'la_last_dest_id_v1';
    global.RECENT_DESTS_KEY = 'la_recent_dests_v1';
    global.RECENT_DESTS_MAX = 5;
    global.ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
    global.GOOGLE_MAPS_JS_KEY = '';
    global.GPS_ACCURACY_LIMIT = 60;
    global.GPS_ACCURACY_LIMIT_FIRST = 120;
    global.GPS_STALE_MS = 45000;
    global.GPS_RECOVERY_POLL_MS = 15000;
    global.GPS_RECOVERY_COOLDOWN_MS = 30000;
    global.SNAP_AO_VIVO_MS = 14000;
    global.SNAP_MIN_PONTOS = 4;
    global.CHECK_HOURS = 4;

    global.FLEET_PADRAO = [
        { id: 'UNO', nome: 'UNO VIVACE', foto: 'https://i.ibb.co/4Lq2XH7/UNO.jpg' },
        { id: 'MONTANA', nome: 'MONTANA', foto: 'https://i.ibb.co/Lht7bLY1/montanta.jpg' }
    ];
    global.MOTORISTAS_PADRAO = ['Marco', 'Fabio'];

    global.UNIDADES_LA = [
        {
            id: 'moema',
            nome: 'L.A. Moema',
            nomeCurto: 'Moema',
            endereco: 'Av. dos Imarés, 398 — Moema, SP',
            lat: -23.612783,
            lng: -46.665663,
            matriz: true
        },
        {
            id: 'vila-olimpia',
            nome: 'Stuttgart — Vila Olímpia',
            nomeCurto: 'Stuttgart',
            endereco: 'Av. Dr. Cardoso de Melo, 1507 — Vila Olímpia, SP — CEP 04548-005',
            lat: -23.5970601,
            lng: -46.6878637,
            matriz: false,
            paradaRota: true
        },
        {
            id: 'mclaren',
            nome: 'McLaren',
            nomeCurto: 'McLaren',
            endereco: 'R. Clodomiro Amazonas, 1000 — Vila Nova Conceição, SP — CEP 04537-002',
            lat: -23.5930138,
            lng: -46.6773446,
            matriz: false,
            paradaRota: true
        },
        {
            id: 'hub',
            nome: 'HUB',
            nomeCurto: 'HUB',
            endereco: 'Av. das Nações Unidas, 16.427 — Várzea de Baixo, SP — CEP 04730-090',
            lat: -23.6352384,
            lng: -46.7182594,
            matriz: false,
            paradaRota: true
        }
    ];

    global.laOrsKey = function () {
        return (global.LA_CONFIG && global.LA_CONFIG.ORS_KEY) || '';
    };
})(typeof window !== 'undefined' ? window : globalThis);
