/**
 * Estado global do app motorista (classic script — var no window).
 * Etapas 6–7 compartilham estas variáveis entre módulos e index.html.
 */
/* eslint-disable no-var */
var idx = 0;
var driver = '';
var driverModoOutro = false;
var running = false;
var dist = 0;
var path = [];
var watch = null;
var bgWatcherId = null;
var map = null;
var marker = null;
var polyline = null;
var startTime = 0;
var timer = null;
var wakeLock = null;
var lastGpsAt = 0;
var monitorSegundoPlanoOk = false;
var gpsRecoveryInterval = null;
var gpsLastRecoveryAt = 0;
var gpsSemSinal = false;
var currentOdoRef = null;
var checkInterval = null;
var mapFollowCar = true;
var unidadesLayer = null;
var linhaSaidaBase = null;
var linhaDestino = null;
var destinoSelecionado = null;
var modoOutrosAberto = false;
var marcadorDestinoCustom = null;
var snapAoVivoEmCurso = false;
var ultimoSnapAoVivo = 0;
var polylinePlanejada = null;
var fleet = typeof FLEET_PADRAO !== 'undefined' ? FLEET_PADRAO.slice() : [];
var unidadesLista = typeof UNIDADES_LA !== 'undefined' ? UNIDADES_LA.slice() : [];
