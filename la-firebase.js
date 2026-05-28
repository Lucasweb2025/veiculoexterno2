/**
 * Fase 3 — Firebase compartilhado (app motorista + painel).
 * A senha NÃO fica aqui: só e-mails públicos cadastrados no Firebase Authentication.
 */
const LA_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB4wDK8VddBeOOrfndLd7LemSGDPupKjF0",
    authDomain: "la-controle.firebaseapp.com",
    databaseURL: "https://la-controle-default-rtdb.firebaseio.com",
    projectId: "la-controle",
    storageBucket: "la-controle.firebasestorage.app",
    messagingSenderId: "847252305513",
    appId: "1:847252305513:web:d2caa9b0404806ea8794f8"
};

/**
 * Conta universal de teste (app + painel usam o mesmo login).
 * Firebase exige formato e-mail — não aceita só "admin"; use o valor abaixo no Console.
 * Cadastre admin@lacustom.test no Firebase Console (senha só no Console).
 */
const LA_AUTH_EMAIL_TESTE = 'admin@lacustom.test';

const LA_AUTH_EMAIL = {
    motorista: LA_AUTH_EMAIL_TESTE,
    painel: LA_AUTH_EMAIL_TESTE
};

if (!firebase.apps.length) {
    firebase.initializeApp(LA_FIREBASE_CONFIG);
}

function laDb() {
    return firebase.database();
}

function laAuth() {
    return firebase.auth();
}

function laMensagemErroAuth(err) {
    const code = (err && err.code) || '';
    const map = {
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-email': 'E-mail inválido no cadastro.',
        'auth/user-disabled': 'Usuário desativado no Firebase.',
        'auth/user-not-found': 'Usuário não cadastrado. Veja FASE-3-ESTUDO.md (passo 1).',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
        'auth/network-request-failed': 'Sem internet para validar o login.'
    };
    return map[code] || 'Não foi possível entrar. Confira usuário no Firebase e tente de novo.';
}

async function laEntrar(perfil, senha) {
    const email = LA_AUTH_EMAIL[perfil];
    if (!email) throw new Error('perfil_invalido');
    return laAuth().signInWithEmailAndPassword(email, senha);
}

async function laSair() {
    return laAuth().signOut();
}

function laObservarAuth(onLogado, onDeslogado) {
    laAuth().onAuthStateChanged(function (user) {
        if (user) onLogado(user);
        else onDeslogado();
    });
}
