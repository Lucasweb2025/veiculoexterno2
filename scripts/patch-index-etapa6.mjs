/**
 * Remove código migrado para destinos.js / mapa.js / constants.js / state.js (etapa 6).
 * Uso: node scripts/patch-index-etapa6.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(root, 'index.html');
let s = readFileSync(p, 'utf8');

function cut(startMarker, endMarker) {
  const i = s.indexOf(startMarker);
  if (i === -1) {
    console.warn('skip (start missing):', startMarker.slice(0, 60));
    return;
  }
  const j = s.indexOf(endMarker, i + startMarker.length);
  if (j === -1) {
    console.warn('skip (end missing):', endMarker.slice(0, 60));
    return;
  }
  s = s.slice(0, i) + s.slice(j);
  console.log('cut ok:', startMarker.slice(0, 50), '→', endMarker.slice(0, 40));
}

// Constantes + estado já em constants.js / state.js
s = s.replace(
  /        const ROUTE_COLOR = '#276EF1';\r?\n        const db = laDb\(\);[\s\S]*?        const ROUTE_PLANNED_COLOR = '#34A853';\r?\n/,
  '        const db = laDb();\n        fleet = FLEET_PADRAO.slice();\n        unidadesLista = UNIDADES_LA.slice();\n'
);

cut('        function trocarDestino()', '        function atualizarKmDisplay()');
cut('        function alternarModoMapa()', '        function mesclarParadasRotaFixa(lista)');
cut('        function mesclarParadasRotaFixa(lista)', '        function setModoCorridaAtiva(');

writeFileSync(p, s);
console.log('index.html patched, chars:', s.length);
