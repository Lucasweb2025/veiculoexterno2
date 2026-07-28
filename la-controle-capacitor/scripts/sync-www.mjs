/**
 * Copia o app motorista da pasta pai (veiculoexterno2/) para www/.
 * Não edite www/ à mão — altere index.html na raiz do repositório.
 */
import { copyFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const www = join(root, 'www');
const src = join(root, '..');

const arquivos = [
  'index.html',
  'painel.html',
  'la-integracao.js',
  'la-config.example.js',
  'manifest.json',
  'sw.js'
];

mkdirSync(www, { recursive: true });

for (const nome of arquivos) {
  const origem = join(src, nome);
  const destino = join(www, nome);
  if (!existsSync(origem)) {
    console.warn('Aviso: não encontrado:', origem);
    continue;
  }
  copyFileSync(origem, destino);
  console.log('OK', nome);
}

const configLocal = join(www, 'la-config.js');
const configRepo = join(src, 'la-config.js');
if (existsSync(configRepo)) {
  copyFileSync(configRepo, configLocal);
  console.log('OK la-config.js');
} else {
  console.log('Dica: copie la-config.example.js → la-config.js e preencha ORS_KEY');
}

const assetsSrc = join(src, 'assets');
const assetsDest = join(www, 'assets');
if (existsSync(assetsSrc)) {
  cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log('OK assets/');
}

console.log('\nFonte:', src);
console.log('Sincronização www/ concluída.');
