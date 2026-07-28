import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'index.html');
let c = readFileSync(path, 'utf8');

const start = c.indexOf('        const ROUTE_COLOR = ');
const end = c.indexOf('        const VEICULO_PROBLEMA_TIPOS = ');
if (start >= 0 && end > start) {
  c = c.slice(0, start) + '        const db = laDb();\n' + c.slice(end);
}

const letStart = c.indexOf('        let idx = 0, driver = ');
const letEnd = c.indexOf('        const VEICULO_PROBLEMA_TIPOS = ');
if (letStart >= 0 && letEnd > letStart) {
  c = c.slice(0, letStart) + c.slice(letEnd);
}

const removeBlocks = [
  ['        function atualizarPreCorridaResumo()', '        function renderizarTiposProblemaVeiculo()'],
  ['        function carregarDestinosRecentes()', '        function renderizarTiposProblemaVeiculo()'],
  ['        function trocarDestino()', '        function renderizarTiposProblemaVeiculo()'],
  ['        function limparPreviewRota()', '        function setModoCorridaAtiva('],
  ['        function limparRotaPlanejada()', '        function setModoCorridaAtiva('],
  ['        function mesclarParadasRotaFixa(', '        function setModoCorridaAtiva('],
  ['        async function initOperation()', '        function setModoCorridaAtiva('],
  ['        /** Leaflet usa [lat, lng]', '        function amostragemPath('],
  ['        function alternarModoMapa()', '        function appEhNativo()'],
];

for (const [from, to] of removeBlocks) {
  const s = c.indexOf(from);
  const e = c.indexOf(to);
  if (s >= 0 && e > s) c = c.slice(0, s) + c.slice(e);
}

writeFileSync(path, c, 'utf8');
console.log('index.html trimmed for etapa 6');
