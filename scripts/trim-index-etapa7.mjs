import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'index.html');
let c = readFileSync(path, 'utf8');

function cut(from, to) {
    const s = c.indexOf(from);
    const e = c.indexOf(to, s + from.length);
    if (s >= 0 && e > s) {
        c = c.slice(0, s) + c.slice(e);
        console.log('cut:', from.slice(0, 45));
        return true;
    }
    console.warn('skip:', from.slice(0, 45));
    return false;
}

cut(
    '        /**\n         * Celular bloqueado = navegador pausa GPS.',
    '        async function logout()'
);

cut('        function verificarViagemPendente()', '        function mudar(n)');

cut('        let estadoVeiculo = null;\n        let problemaVeiculoAtual = null;\n\n', '        function showScreen(id)');

cut('        function atualizarKmDisplay()', '        function voltarDoMapa()');

cut('        function atualizarGpsUi(acc, modo)', '        function validarInicioCorrida()');

cut('        async function desenharRotaPlanejadaAteDestino()', '        function publicarPosicaoAtualNoFirebase');

cut('        function validarInicioCorrida()', '        function amostragemPath(pontos, max)');

cut('        function amostragemPath(pontos, max)', '    </script>');

const scripts = `    <script src="assets/js/backup-viagem.js"></script>
    <script src="assets/js/gps.js"></script>
    <script src="assets/js/corrida.js"></script>
`;
if (!c.includes('backup-viagem.js')) {
    c = c.replace(
        '    <script src="assets/js/mapa.js"></script>\n',
        '    <script src="assets/js/mapa.js"></script>\n' + scripts
    );
}

writeFileSync(path, c, 'utf8');
console.log('index.html trimmed for etapa 7');
