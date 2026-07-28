/**
 * Utilitários compartilhados — motorista e painel.
 * Expõe funções no escopo global (sem bundler por enquanto).
 */
(function (global) {
    'use strict';

    function escHtml(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    function escHtmlAttr(s) {
        return escHtml(s).replace(/"/g, '&quot;');
    }

    /** Alias do painel — vazio vira "---" */
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '---';
        return d.innerHTML;
    }

    function formatarTempo(ms) {
        const totalSecs = Math.floor(ms / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        if (h > 0) {
            return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function normalizarTexto(s) {
        return (s || '').trim().toLowerCase();
    }

    function parseTripDate(str) {
        if (!str) return null;
        const parte = String(str).split(',')[0].trim();
        const p = parte.split('/');
        if (p.length !== 3) return null;
        const d = parseInt(p[0], 10);
        const m = parseInt(p[1], 10) - 1;
        const y = parseInt(p[2], 10);
        if (!d || m < 0 || !y) return null;
        return new Date(y, m, d);
    }

    function parseInputDate(val) {
        if (!val) return null;
        const p = val.split('-').map(Number);
        if (p.length !== 3) return null;
        return new Date(p[0], p[1] - 1, p[2]);
    }

    function diaMs(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }

    global.escHtml = escHtml;
    global.escHtmlAttr = escHtmlAttr;
    global.esc = esc;
    global.formatarTempo = formatarTempo;
    global.normalizarTexto = normalizarTexto;
    global.parseTripDate = parseTripDate;
    global.parseInputDate = parseInputDate;
    global.diaMs = diaMs;
})(typeof window !== 'undefined' ? window : globalThis);
