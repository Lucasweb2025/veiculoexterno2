/**
 * Carrega SDK Supabase + la-supabase.js.
 * Deve vir após la-config.js (SUPABASE_URL + SUPABASE_ANON_KEY obrigatórios).
 */
(function (global) {
    'use strict';

    var cfg = global.LA_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
        console.error('Configure SUPABASE_URL e SUPABASE_ANON_KEY em la-config.js');
    }

    function loadScript(src) {
        document.write('<script src="' + src + '"><\/script>');
    }

    loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    loadScript('assets/js/la-supabase.js');
})(typeof window !== 'undefined' ? window : globalThis);
