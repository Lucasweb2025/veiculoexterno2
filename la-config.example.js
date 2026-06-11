/**
 * Copie para la-config.js (não vai pro Git).
 * cp la-config.example.js la-config.js
 */
window.LA_CONFIG = window.LA_CONFIG || {};
window.LA_CONFIG.ORS_KEY = '';

/** Integração plataforma L.A. — URL que recebe POST JSON (ver docs/INTEGRACAO-PLATAFORMA.md) */
window.LA_CONFIG.WEBHOOK_URL = '';

/** Opcional: Bearer token para autenticar no webhook da plataforma */
window.LA_CONFIG.PLATAFORMA_API_KEY = '';

/** Identificador do ambiente: dev | homolog | prod */
window.LA_CONFIG.AMBIENTE = 'dev';
