/**
 * Login e sessão — painel gestor.
 * Hooks: window.laAposLoginPainel e window.laAoSairPainel no painel.html.
 */
(function (global) {
    'use strict';

    function mostrarPainelLogado() {
        return laValidarPapel([LA_PAPEIS.GESTOR, LA_PAPEIS.ADMIN]).then(async function () {
            document.getElementById('painel-login').style.display = 'none';
            const content = document.getElementById('painel-content');
            content.style.display = 'flex';
            if (typeof global.laAposLoginPainel === 'function') {
                await global.laAposLoginPainel();
            }
        });
    }

    function mostrarPainelLogin(err) {
        document.getElementById('painel-login').style.display = 'flex';
        document.getElementById('painel-content').style.display = 'none';
        if (typeof global.laAoSairPainel === 'function') global.laAoSairPainel();
        if (err && err.code) alert(laMensagemErroAuth(err));
    }

    async function loginPainel() {
        const email = document.getElementById('email-painel').value;
        const senha = document.getElementById('senha-painel').value;
        const btn = document.getElementById('btn-login-painel');
        if (!email.trim() || !senha) return alert('Preencha e-mail e senha.');
        btn.disabled = true;
        btn.textContent = 'Entrando...';
        try {
            await laEntrar(email, senha);
            document.getElementById('senha-painel').value = '';
        } catch (err) {
            alert(laMensagemErroAuth(err));
        } finally {
            btn.disabled = false;
            btn.textContent = 'Entrar';
        }
    }

    async function logoutPainel() {
        if (typeof global.laAoSairPainel === 'function') global.laAoSairPainel();
        await laSair();
        location.reload();
    }

    function iniciarSessaoPainel() {
        laObservarAuth(mostrarPainelLogado, mostrarPainelLogin);
    }

    global.mostrarPainelLogado = mostrarPainelLogado;
    global.mostrarPainelLogin = mostrarPainelLogin;
    global.loginPainel = loginPainel;
    global.logoutPainel = logoutPainel;
    global.iniciarSessaoPainel = iniciarSessaoPainel;
})(typeof window !== 'undefined' ? window : globalThis);
