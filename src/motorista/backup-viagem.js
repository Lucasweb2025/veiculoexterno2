/**
 * Backup local de corrida e motivo da viagem — etapa 7.
 */
var MOTIVO_PADRAO = 'Deslocamento operacional';

function verificarViagemPendente() {
    const backup = localStorage.getItem(TRIP_BACKUP_KEY);
    if (!backup) return;
    try {
        const data = JSON.parse(backup);
        if (confirm('Viagem anterior não finalizada!\n' + data.car + ' - ' + data.driver + '\n' + data.km.toFixed(2) + ' km\n\nSalvar agora?')) {
            salvarViagemRecuperada(data);
        } else {
            localStorage.removeItem(TRIP_BACKUP_KEY);
        }
    } catch (e) {
        localStorage.removeItem(TRIP_BACKUP_KEY);
    }
}

async function salvarViagemRecuperada(data) {
    try {
        const trip = {
            car: data.car,
            driver: data.driver,
            km: data.km,
            time: data.time,
            date: data.date,
            path: data.path,
            destino: data.destino || '—',
            destinoId: data.destinoId || null,
            motivoCorrida: data.motivoCorrida || '—'
        };
        await laPersistirViagemFinal(data.carId, data.km, trip);
        localStorage.removeItem(TRIP_BACKUP_KEY);
        alert('Viagem recuperada e salva!');
    } catch (e) {
        alert('Erro ao salvar. Tente novamente.');
    }
}

function salvarBackupViagem() {
    if (!running) return;
    localStorage.setItem(TRIP_BACKUP_KEY, JSON.stringify({
        carId: fleet[idx].id,
        car: fleet[idx].nome,
        driver: driver,
        km: parseFloat((dist / 1000).toFixed(2)),
        time: document.getElementById('tempo').innerText,
        date: new Date().toLocaleString('pt-BR'),
        path: path,
        startTime: startTime,
        destino: destinoSelecionado ? destinoSelecionado.nomeCurto || destinoSelecionado.nome : null,
        destinoId: destinoSelecionado ? destinoSelecionado.id : null,
        motivoCorrida: getMotivoCorridaResolvido()
    }));
}

function getMotivoCorridaResolvido() {
    const select = document.getElementById('motivo-corrida-select');
    const outroInput = document.getElementById('motivo-corrida-outro');
    if (!select) return '';
    if (select.value === 'outro') {
        const t = outroInput ? outroInput.value.trim() : '';
        return t || MOTIVO_PADRAO;
    }
    const label = select.options[select.selectedIndex];
    const texto = label && label.value ? label.text : '';
    return texto || MOTIVO_PADRAO;
}

function onChangeMotivoCorrida() {
    const select = document.getElementById('motivo-corrida-select');
    const outroInput = document.getElementById('motivo-corrida-outro');
    if (!select || !outroInput) return;
    const isOutro = select.value === 'outro';
    outroInput.style.display = isOutro ? 'block' : 'none';
    if (!isOutro) outroInput.value = '';
}
