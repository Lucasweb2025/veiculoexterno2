/**
 * Migra export JSON do Firebase RTDB para Supabase Postgres.
 * Uso local apenas — nunca commitar SUPABASE_SERVICE_ROLE_KEY.
 *
 *   set SUPABASE_URL=https://....supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   node scripts/migrate-firebase-to-supabase.mjs export-la-controle.json
 */
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const exportPath = process.argv[2];
if (!exportPath) {
    console.error('Uso: node scripts/migrate-firebase-to-supabase.mjs <export.json>');
    process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
    console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const sb = createClient(url, key);
const data = JSON.parse(readFileSync(exportPath, 'utf8'));

function asUuid(id) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return id;
    return randomUUID();
}

async function upsert(table, rows) {
    if (!rows.length) return;
    const { error } = await sb.from(table).upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`OK ${table}: ${rows.length} linhas`);
}

function fleetRows(val) {
    return Object.entries(val || {}).map(([id, v]) => ({
        id, nome: v.nome || id, foto: v.foto || null, ativo: v.ativo !== false
    }));
}

function motoristasRows(val) {
    return Object.entries(val || {}).map(([id, m]) => ({
        id, nome: m.nome || id, ativo: m.ativo !== false
    }));
}

function unidadesRows(val) {
    return Object.entries(val || {}).map(([id, u]) => ({
        id,
        nome: u.nome || id,
        nome_curto: u.nomeCurto || u.nome,
        endereco: u.endereco || null,
        lat: parseFloat(u.lat),
        lng: parseFloat(u.lng),
        matriz: !!u.matriz,
        parada_rota: !!u.paradaRota,
        ordem_rota: u.ordemRota != null ? parseInt(u.ordemRota, 10) : null
    }));
}

function vehiclesRows(val) {
    return Object.entries(val || {}).map(([id, v]) => ({
        id,
        status: v.status || 'DISPONÍVEL',
        odometer: v.odometer || 0,
        last_pos: v.last_pos || null
    }));
}

function tripsRows(val) {
    return Object.entries(val || {}).map(([id, t]) => ({
        id: asUuid(id),
        car: t.car,
        driver: t.driver,
        km: t.km,
        time: t.time,
        date: t.date,
        path: t.path,
        destino: t.destino,
        destino_id: t.destinoId,
        endereco_destino: t.enderecoDestino,
        motivo_corrida: t.motivoCorrida,
        problema_veiculo: t.problemaVeiculo
    }));
}

function issuesRows(val) {
    return Object.entries(val || {}).map(([id, i]) => ({
        id: asUuid(id),
        vehicle_id: i.vehicleId,
        vehicle_name: i.vehicleName,
        driver: i.driver,
        tipos: i.tipos,
        descricao: i.descricao,
        urgencia: i.urgencia,
        status: i.status || 'aberto',
        date: i.date
    }));
}

function maintRows(val) {
    const rows = [];
    Object.entries(val || {}).forEach(([vehicleId, regs]) => {
        Object.entries(regs || {}).forEach(([id, m]) => {
            rows.push({
                id: asUuid(id),
                vehicle_id: vehicleId,
                vehicle_name: m.vehicleName,
                tipo: m.tipo,
                descricao: m.descricao,
                date: m.date,
                km: m.km,
                oficina: m.oficina,
                custo: m.custo,
                driver: m.driver,
                role: m.role,
                criado_em: m.criadoEm || new Date().toISOString(),
                registrado_por: m.registradoPor,
                registrado_uid: m.registradoUid || null
            });
        });
    });
    return rows;
}

async function main() {
    await upsert('fleet', fleetRows(data.fleet));
    await upsert('motoristas', motoristasRows(data.motoristas));
    await upsert('unidades', unidadesRows(data.unidades));
    await upsert('vehicles', vehiclesRows(data.vehicles));
    await upsert('trips', tripsRows(data.trips));
    await upsert('vehicle_issues', issuesRows(data.vehicle_issues));
    const maint = maintRows(data.vehicle_maintenance);
    if (maint.length) {
        const { error } = await sb.from('vehicle_maintenance').upsert(maint, { onConflict: 'id' });
        if (error) throw error;
        console.log(`OK vehicle_maintenance: ${maint.length} linhas`);
    }
    console.log('\nMigração concluída. Perfis Auth: cadastre manualmente em profiles.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
