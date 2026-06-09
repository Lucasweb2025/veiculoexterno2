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

/** E-mail e senha vêm da tela de login — cadastre usuários no Firebase Console. */

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
        'auth/network-request-failed': 'Sem internet para validar o login.',
        'auth/missing-fields': 'Preencha e-mail e senha.',
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/no-role': 'Usuário sem perfil.\n\nPeça ao gestor para cadastrar seu papel em /users no Firebase (FIREBASE-PERFIS.md).',
        'auth/wrong-role': 'Esta conta não acessa esta tela.\n\nMotorista → app. Gestor → painel.',
        'auth/not-logged-in': 'Sessão expirada. Entre de novo.'
    };
    return map[code] || 'Não foi possível entrar. Confira usuário no Firebase e tente de novo.';
}

/** Papéis em /users/{uid}/role — ver FIREBASE-PERFIS.md */
const LA_PAPEIS = {
    MOTORISTA: 'motorista',
    GESTOR: 'gestor',
    ADMIN: 'admin'
};

async function laObterPapelUsuario(user) {
    const u = user || laAuth().currentUser;
    if (!u) return null;
    const snap = await laDb().ref('users/' + u.uid + '/role').once('value');
    return snap.val() || null;
}

async function laValidarPapel(papeisPermitidos) {
    const user = laAuth().currentUser;
    if (!user) {
        const err = new Error('not-logged');
        err.code = 'auth/not-logged-in';
        throw err;
    }
    const papel = await laObterPapelUsuario(user);
    if (!papel) {
        const err = new Error('no-role');
        err.code = 'auth/no-role';
        throw err;
    }
    if (!papeisPermitidos.includes(papel)) {
        const err = new Error('wrong-role');
        err.code = 'auth/wrong-role';
        throw err;
    }
    return papel;
}

/**
 * Salva viagem final de forma atômica: status + odômetro + trip num único update.
 */
async function laPersistirViagemFinal(carId, kmFinal, trip) {
    const tripKey = laDb().ref('trips').push().key;
    const odoSnap = await laDb().ref('vehicles/' + carId + '/odometer').once('value');
    const odoAtual = odoSnap.val() || 0;
    const updates = {};
    updates['vehicles/' + carId + '/status'] = 'DISPONÍVEL';
    updates['vehicles/' + carId + '/odometer'] = odoAtual + kmFinal;
    updates['trips/' + tripKey] = trip;
    await laDb().ref().update(updates);
}

/** Login com e-mail e senha digitados na tela (Firebase Authentication). */
async function laEntrar(email, senha) {
    const e = (email || '').trim();
    if (!e || !senha) {
        const err = new Error('missing');
        err.code = 'auth/missing-fields';
        throw err;
    }
    return laAuth().signInWithEmailAndPassword(e, senha);
}

async function laSair() {
    return laAuth().signOut();
}

function laObservarAuth(onLogado, onDeslogado) {
    laAuth().onAuthStateChanged(async function (user) {
        if (user) {
            try {
                await onLogado(user);
            } catch (err) {
                await laSair();
                onDeslogado(err);
            }
        } else {
            onDeslogado();
        }
    });
}
