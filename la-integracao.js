/**
 * Integração com a plataforma L.A. — webhook configurável em la-config.js
 * Eventos: viagem_finalizada, alerta_veiculo
 */
async function laEnviarEventoPlataforma(evento, dados) {
    const cfg = window.LA_CONFIG || {};
    const url = (cfg.WEBHOOK_URL || '').trim();
    if (!url) return;

    const user = laAuth().currentUser;
    const body = {
        origem: 'la-controle-frota',
        versao: '1.0',
        evento: evento,
        enviadoEm: new Date().toISOString(),
        usuarioUid: user ? user.uid : null,
        usuarioEmail: user ? user.email : null,
        dados: dados
    };

    const headers = { 'Content-Type': 'application/json' };
    if (cfg.PLATAFORMA_API_KEY) {
        headers['Authorization'] = 'Bearer ' + cfg.PLATAFORMA_API_KEY;
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) console.warn('Plataforma respondeu', res.status);
    } catch (e) {
        console.warn('Falha ao enviar para plataforma (viagem salva no Supabase):', e);
    }
}
