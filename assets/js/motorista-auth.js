/**
 * Login e sessão — app motorista.
 * Pós-login: define window.laAposLoginMotorista no index.html.
 */
(function (global) {
    'use strict';

    function mostrarTelaLogin(err) {
        document.getElementById('tela-login').classList.add('active');
        document.getElementById('app-content').style.display = 'none';
        if (err && err.code) alert(laMensagemErroAuth(err));
    }

    function irParaPainelGestor() {
        window.location.href = 'painel.html';
    }

    async function validarLogin() {
        const email = document.getElementById('email-acesso').value;
        const senha = document.getElementById('senha-acesso').value;
        const btn = document.getElementById('btn-login');
        if (!email.trim() || !senha) return alert('Preencha e-mail e senha.');
        btn.disabled = true;
        btn.innerText = 'Entrando...';
        try {
            await laEntrar(email, senha);
            document.getElementById('senha-acesso').value = '';
        } catch (err) {
            alert(laMensagemErroAuth(err));
        } finally {
            btn.disabled = false;
            btn.innerText = 'Entrar';
        }
    }

    function mostrarAppLogado() {
        return laValidarPapel([LA_PAPEIS.MOTORISTA, LA_PAPEIS.ADMIN]).then(async function () {
            document.getElementById('tela-login').classList.remove('active');
            document.getElementById('app-content').style.display = 'block';
            if (typeof global.laAposLoginMotorista === 'function') {
                await global.laAposLoginMotorista();
            }
        });
    }

    /** @param {function} [prepararApp] — ex.: configurarMonitoramentoSegundoPlano */
    function verificarSessao(prepararApp) {
        if (typeof prepararApp === 'function') prepararApp();
        laObservarAuth(mostrarAppLogado, mostrarTelaLogin);
    }

    global.mostrarTelaLogin = mostrarTelaLogin;
    global.irParaPainelGestor = irParaPainelGestor;
    global.validarLogin = validarLogin;
    global.mostrarAppLogado = mostrarAppLogado;
    global.verificarSessao = verificarSessao;
})(typeof window !== 'undefined' ? window : globalThis);
