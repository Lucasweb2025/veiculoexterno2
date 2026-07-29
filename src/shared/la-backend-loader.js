/**
 * Carrega Firebase ou Supabase conforme LA_CONFIG.BACKEND (default: firebase).
 * Deve vir após la-config.js no HTML.
 */
(function (global) {
    'use strict';

    var cfg = global.LA_CONFIG || {};
    var useSupabase = cfg.BACKEND === 'supabase' && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY;

    function loadScript(src) {
        document.write('<script src="' + src + '"><\/script>');
    }

    if (useSupabase) {
        loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        loadScript('assets/js/la-supabase.js');
    } else {
        loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
        loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js');
        loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
        loadScript('assets/js/la-firebase.js');
    }

    global.laUsaSupabase = function () {
        return useSupabase;
    };
})(typeof window !== 'undefined' ? window : globalThis);
