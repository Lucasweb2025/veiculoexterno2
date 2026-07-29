/**
 * Supabase — auth e persistência (espelha la-firebase.js).
 * Requer: @supabase/supabase-js (CDN) + LA_CONFIG.SUPABASE_URL / SUPABASE_ANON_KEY
 */
(function (global) {
    'use strict';

    var client = null;
    var cachedUser = null;

    function laSupabase() {
        if (client) return client;
        var cfg = global.LA_CONFIG || {};
        if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
            throw new Error('Supabase não configurado em la-config.js');
        }
        if (!global.supabase || !global.supabase.createClient) {
            throw new Error('SDK Supabase não carregado');
        }
        client = global.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
        return client;
    }

    global.laUsaSupabase = function () {
        var c = global.LA_CONFIG || {};
        return c.BACKEND === 'supabase' && c.SUPABASE_URL && c.SUPABASE_ANON_KEY;
    };

    global.LA_PAPEIS = {
        MOTORISTA: 'motorista',
        GESTOR: 'gestor',
        ADMIN: 'admin'
    };

    function laMensagemErroAuth(err) {
        var code = (err && err.code) || '';
        var map = {
            invalid_credentials: 'E-mail ou senha incorretos.',
            email_not_confirmed: 'Confirme o e-mail antes de entrar.',
            user_not_found: 'Usuário não cadastrado.',
            invalid_email: 'E-mail inválido.',
            'auth/no-role': 'Usuário sem perfil.\n\nCadastre role em profiles (docs/SUPABASE-MIGRACAO.md).',
            'auth/wrong-role': 'Esta conta não acessa esta tela.\n\nMotorista → app. Gestor → painel.',
            'auth/not-logged-in': 'Sessão expirada. Entre de novo.',
            'auth/missing-fields': 'Preencha e-mail e senha.'
        };
        return map[code] || (err && err.message) || 'Não foi possível entrar. Tente de novo.';
    }
    global.laMensagemErroAuth = laMensagemErroAuth;

    global.laObterPapelUsuario = async function (user) {
        var sb = laSupabase();
        var u = user || (await sb.auth.getUser()).data.user;
        if (!u) return null;
        var res = await sb.from('profiles').select('role').eq('id', u.id).maybeSingle();
        if (res.error) {
            console.warn('profiles', res.error);
            return null;
        }
        return res.data ? res.data.role : null;
    };

    global.laValidarPapel = async function (papeisPermitidos) {
        var sb = laSupabase();
        var session = (await sb.auth.getSession()).data.session;
        if (!session || !session.user) {
            var err = new Error('not-logged');
            err.code = 'auth/not-logged-in';
            throw err;
        }
        var papel = await global.laObterPapelUsuario(session.user);
        if (!papel) {
            var err2 = new Error('no-role');
            err2.code = 'auth/no-role';
            throw err2;
        }
        if (papeisPermitidos.indexOf(papel) === -1) {
            var err3 = new Error('wrong-role');
            err3.code = 'auth/wrong-role';
            throw err3;
        }
        return papel;
    };

    global.laSalvarManutencaoVeiculo = async function (vehicleId, dados) {
        var sb = laSupabase();
        var user = (await sb.auth.getUser()).data.user;
        var payload = {
            vehicle_id: vehicleId,
            vehicle_name: dados.vehicleName,
            tipo: dados.tipo,
            descricao: dados.descricao,
            date: dados.date,
            km: dados.km,
            oficina: dados.oficina,
            custo: dados.custo,
            driver: dados.driver,
            role: dados.role,
            registrado_por: user ? user.email : null,
            registrado_uid: user ? user.id : null
        };
        var res = await sb.from('vehicle_maintenance').insert(payload).select('id').single();
        if (res.error) throw res.error;
        return res.data.id;
    };

    global.laSalvarProblemaVeiculo = async function (dados) {
        var sb = laSupabase();
        var payload = Object.assign({}, dados, {
            vehicle_id: dados.vehicleId,
            vehicle_name: dados.vehicleName,
            status: 'aberto',
            date: new Date().toLocaleString('pt-BR')
        });
        var res = await sb.from('vehicle_issues').insert(payload).select('id').single();
        if (res.error) throw res.error;
        var issueId = res.data.id;
        if (typeof global.laEnviarEventoPlataforma === 'function') {
            global.laEnviarEventoPlataforma('alerta_veiculo', Object.assign({ issueId: issueId }, dados, { status: 'aberto', date: payload.date }));
        }
        return issueId;
    };

    global.laPersistirViagemFinal = async function (carId, kmFinal, trip) {
        var sb = laSupabase();
        var res = await sb.rpc('persistir_viagem_final', {
            p_car_id: carId,
            p_km: kmFinal,
            p_trip: trip
        });
        if (res.error) throw res.error;
        var out = res.data || {};
        if (typeof global.laEnviarEventoPlataforma === 'function') {
            global.laEnviarEventoPlataforma('viagem_finalizada', {
                tripId: out.tripKey,
                vehicleId: carId,
                trip: trip
            });
        }
        return { tripKey: out.tripKey, trip: out.trip || trip };
    };

    global.laEntrar = async function (email, senha) {
        var e = (email || '').trim();
        if (!e || !senha) {
            var err = new Error('missing');
            err.code = 'auth/missing-fields';
            throw err;
        }
        var sb = laSupabase();
        var res = await sb.auth.signInWithPassword({ email: e, password: senha });
        if (res.error) throw res.error;
        cachedUser = res.data.user;
        return res.data;
    };

    global.laSair = async function () {
        cachedUser = null;
        return laSupabase().auth.signOut();
    };

    global.laObservarAuth = function (onLogado, onDeslogado) {
        var sb = laSupabase();
        var sub = sb.auth.onAuthStateChange(async function (event, session) {
            if (session && session.user) {
                cachedUser = session.user;
                try {
                    await onLogado(session.user);
                } catch (err) {
                    cachedUser = null;
                    await global.laSair();
                    onDeslogado(err);
                }
            } else {
                cachedUser = null;
                onDeslogado();
            }
        });
        return function () {
            if (sub && sub.data && sub.data.subscription) {
                sub.data.subscription.unsubscribe();
            }
        };
    };

    /** Compat: laAuth().currentUser — la-integracao.js */
    global.laAuth = function () {
        return {
            get currentUser() {
                if (!cachedUser) return null;
                return {
                    uid: cachedUser.id,
                    email: cachedUser.email
                };
            }
        };
    };

    global.laSupabase = laSupabase;

    global.laDb = function () {
        console.warn('laDb() não existe no Supabase — use la-store.js');
        return null;
    };
})(typeof window !== 'undefined' ? window : globalThis);
