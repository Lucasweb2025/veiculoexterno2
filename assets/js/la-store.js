/**
 * Camada de dados unificada — espelha laDb().ref() para Firebase e Supabase.
 */
(function (global) {
    'use strict';

    function usaSupabase() {
        return typeof global.laUsaSupabase === 'function' && global.laUsaSupabase();
    }

    function sb() {
        if (!global.laSupabase) throw new Error('Supabase não carregado');
        return global.laSupabase();
    }

    // --- mapeamento Supabase → formato Firebase ---

    function rowIssue(row) {
        return {
            vehicleId: row.vehicle_id,
            vehicleName: row.vehicle_name,
            driver: row.driver,
            tipos: row.tipos,
            descricao: row.descricao,
            urgencia: row.urgencia,
            status: row.status,
            date: row.date
        };
    }

    function rowMaint(row) {
        return {
            vehicleName: row.vehicle_name,
            tipo: row.tipo,
            descricao: row.descricao,
            date: row.date,
            km: row.km,
            oficina: row.oficina,
            custo: row.custo,
            driver: row.driver,
            role: row.role,
            criadoEm: row.criado_em,
            registradoPor: row.registrado_por,
            registradoUid: row.registrado_uid
        };
    }

    function rowTrip(row) {
        return {
            car: row.car,
            driver: row.driver,
            km: row.km,
            time: row.time,
            date: row.date,
            path: row.path,
            destino: row.destino,
            destinoId: row.destino_id,
            enderecoDestino: row.endereco_destino,
            motivoCorrida: row.motivo_corrida,
            problemaVeiculo: row.problema_veiculo
        };
    }

    function issuesMapFromRows(rows) {
        var map = {};
        (rows || []).forEach(function (row) {
            map[row.id] = rowIssue(row);
        });
        return map;
    }

    function maintFlatFromRows(rows, vehicleId) {
        var map = {};
        (rows || []).forEach(function (row) {
            if (vehicleId && row.vehicle_id !== vehicleId) return;
            map[row.id] = rowMaint(row);
        });
        return map;
    }

    function maintNestedFromRows(rows) {
        var map = {};
        (rows || []).forEach(function (row) {
            var vid = row.vehicle_id;
            if (!map[vid]) map[vid] = {};
            map[vid][row.id] = rowMaint(row);
        });
        return map;
    }

    function tripsMapFromRows(rows) {
        var map = {};
        (rows || []).forEach(function (row) {
            map[row.id] = rowTrip(row);
        });
        return map;
    }

    function subscribeTable(table, onChange, filter) {
        var client = sb();
        var channelName = 'la-' + table + '-' + Math.random().toString(36).slice(2);
        var ch = client.channel(channelName);
        var opts = { event: '*', schema: 'public', table: table };
        if (filter) opts.filter = filter;
        ch.on('postgres_changes', opts, function () {
            onChange();
        });
        ch.subscribe();
        return function () {
            client.removeChannel(ch);
        };
    }

    // --- Fleet ---

    global.laCarregarFleet = function () {
        if (!usaSupabase()) {
            return new Promise(function (resolve) {
                global.laDb().ref('fleet').once('value', function (snap) {
                    resolve(snap.val() || null);
                }, function () { resolve(null); });
            });
        }
        return sb().from('fleet').select('*').then(function (res) {
            if (res.error) throw res.error;
            var map = {};
            (res.data || []).forEach(function (row) {
                map[row.id] = { nome: row.nome, foto: row.foto, ativo: row.ativo };
            });
            return Object.keys(map).length ? map : null;
        });
    };

    global.laCarregarMotoristas = function () {
        if (!usaSupabase()) {
            return new Promise(function (resolve) {
                global.laDb().ref('motoristas').once('value', function (snap) {
                    resolve(snap.val() || null);
                }, function () { resolve(null); });
            });
        }
        return sb().from('motoristas').select('*').then(function (res) {
            if (res.error) throw res.error;
            var map = {};
            (res.data || []).forEach(function (row) {
                map[row.id] = { nome: row.nome, ativo: row.ativo };
            });
            return Object.keys(map).length ? map : null;
        });
    };

    global.laCarregarUnidades = function () {
        if (!usaSupabase()) {
            return new Promise(function (resolve) {
                global.laDb().ref('unidades').once('value', function (snap) {
                    resolve(snap.val() || null);
                }, function () { resolve(null); });
            });
        }
        return sb().from('unidades').select('*').then(function (res) {
            if (res.error) throw res.error;
            if (!res.data || !res.data.length) return null;
            var map = {};
            res.data.forEach(function (row) {
                map[row.id] = {
                    nome: row.nome,
                    nomeCurto: row.nome_curto,
                    endereco: row.endereco,
                    lat: row.lat,
                    lng: row.lng,
                    matriz: row.matriz,
                    paradaRota: row.parada_rota,
                    ordemRota: row.ordem_rota
                };
            });
            return map;
        });
    };

    // --- Vehicles ---

    global.laSetVehicleStatus = function (carId, status) {
        if (!usaSupabase()) {
            return global.laDb().ref('vehicles/' + carId + '/status').set(status);
        }
        return sb().from('vehicles').upsert({ id: carId, status: status }).then(function (res) {
            if (res.error) throw res.error;
        });
    };

    global.laSetVehicleLastPos = function (carId, data) {
        if (!usaSupabase()) {
            return global.laDb().ref('vehicles/' + carId + '/last_pos').set(data);
        }
        return sb().from('vehicles').upsert({ id: carId, last_pos: data }).then(function (res) {
            if (res.error) throw res.error;
        });
    };

    global.laEscutarOdometro = function (carId, cb) {
        if (!usaSupabase()) {
            var ref = global.laDb().ref('vehicles/' + carId + '/odometer');
            var handler = function (snap) { cb(snap.val()); };
            ref.on('value', handler);
            return function () { ref.off('value', handler); };
        }
        var unsubRt = null;
        function refresh() {
            sb().from('vehicles').select('odometer').eq('id', carId).maybeSingle()
                .then(function (res) {
                    if (!res.error) cb(res.data ? res.data.odometer : 0);
                });
        }
        refresh();
        unsubRt = subscribeTable('vehicles', refresh, 'id=eq.' + carId);
        return function () { if (unsubRt) unsubRt(); };
    };

    // --- Issues ---

    global.laResolverIssue = function (issueId) {
        if (!usaSupabase()) {
            return global.laDb().ref('vehicle_issues/' + issueId + '/status').set('resolvido');
        }
        return sb().from('vehicle_issues').update({ status: 'resolvido' }).eq('id', issueId)
            .then(function (res) { if (res.error) throw res.error; });
    };

    global.laEscutarIssues = function (cb) {
        if (!usaSupabase()) {
            var ref = global.laDb().ref('vehicle_issues');
            var handler = function (snap) { cb(snap.val() || {}); };
            ref.on('value', handler);
            return function () { ref.off('value', handler); };
        }
        var unsubRt = null;
        function refresh() {
            sb().from('vehicle_issues').select('*').order('created_at', { ascending: false })
                .then(function (res) {
                    if (!res.error) cb(issuesMapFromRows(res.data));
                });
        }
        refresh();
        unsubRt = subscribeTable('vehicle_issues', refresh);
        return function () { if (unsubRt) unsubRt(); };
    };

    // --- Maintenance ---

    global.laEscutarManutencaoVeiculo = function (carId, cb) {
        if (!usaSupabase()) {
            var ref = global.laDb().ref('vehicle_maintenance/' + carId);
            var handler = function (snap) { cb(snap.val() || {}); };
            ref.on('value', handler);
            return function () { ref.off('value', handler); };
        }
        var unsubRt = null;
        function refresh() {
            sb().from('vehicle_maintenance').select('*').eq('vehicle_id', carId)
                .order('criado_em', { ascending: false })
                .then(function (res) {
                    if (!res.error) cb(maintFlatFromRows(res.data, carId));
                });
        }
        refresh();
        unsubRt = subscribeTable('vehicle_maintenance', refresh, 'vehicle_id=eq.' + carId);
        return function () { if (unsubRt) unsubRt(); };
    };

    global.laEscutarManutencoesPainel = function (cb) {
        if (!usaSupabase()) {
            var ref = global.laDb().ref('vehicle_maintenance');
            var handler = function (snap) { cb(snap.val() || {}); };
            ref.on('value', handler);
            return function () { ref.off('value', handler); };
        }
        var unsubRt = null;
        function refresh() {
            sb().from('vehicle_maintenance').select('*').order('criado_em', { ascending: false })
                .then(function (res) {
                    if (!res.error) cb(maintNestedFromRows(res.data));
                });
        }
        refresh();
        unsubRt = subscribeTable('vehicle_maintenance', refresh);
        return function () { if (unsubRt) unsubRt(); };
    };

    // --- Trips ---

    global.laEscutarTrips = function (cb) {
        if (!usaSupabase()) {
            var ref = global.laDb().ref('trips');
            var handler = function (snap) { cb(snap.val() || {}); };
            ref.on('value', handler);
            return function () { ref.off('value', handler); };
        }
        var unsubRt = null;
        function refresh() {
            sb().from('trips').select('*').order('created_at', { ascending: true })
                .then(function (res) {
                    if (!res.error) cb(tripsMapFromRows(res.data));
                });
        }
        refresh();
        unsubRt = subscribeTable('trips', refresh);
        return function () { if (unsubRt) unsubRt(); };
    };
})(typeof window !== 'undefined' ? window : globalThis);
