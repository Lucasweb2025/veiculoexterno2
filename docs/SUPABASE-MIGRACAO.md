# Migração Firebase → Supabase

Guia para ativar o backend Supabase no L.A. Controle (`veiculoexterno2`).

**Projeto:** https://ccysxafhvgqrjlofvavp.supabase.co

---

## 1. Dashboard Supabase

### API (Settings → API)

1. Copie **Project URL** → `LA_CONFIG.SUPABASE_URL`
2. Copie **anon public key** → `LA_CONFIG.SUPABASE_ANON_KEY` em `la-config.js` (não commitar)

### Authentication (Authentication → Providers)

1. Habilite **Email / Password**
2. Crie usuários de teste (motorista e gestor)

### SQL (SQL Editor)

1. Rode `supabase/schema.sql` (tabelas, RLS, RPC `persistir_viagem_final`)
2. Rode `supabase/seed.sql` (fleet, motoristas, unidades, veículos)
3. Insira perfis após criar usuários no Auth:

```sql
insert into public.profiles (id, email, role) values
  ('UUID-DO-MOTORISTA', 'motorista@exemplo.com', 'motorista'),
  ('UUID-DO-GESTOR', 'gestor@exemplo.com', 'gestor');
```

O UUID é o `id` do usuário em **Authentication → Users**.

### Realtime (Database → Publications)

Habilite replicação para:

- `trips`
- `vehicle_issues`
- `vehicle_maintenance`
- `vehicles`

Sem isso, o painel e a aba revisão não atualizam ao vivo.

---

## 2. Configuração local (`la-config.js`)

Copie de `la-config.example.js` e altere:

```javascript
window.LA_CONFIG.BACKEND = 'supabase';
window.LA_CONFIG.SUPABASE_URL = 'https://ccysxafhvgqrjlofvavp.supabase.co';
window.LA_CONFIG.SUPABASE_ANON_KEY = 'eyJ...'; // anon key do dashboard
```

Com `BACKEND = 'firebase'` (padrão), nada muda — produção atual continua no Firebase.

---

## 3. Arquitetura no código

```
index.html / painel.html
    → la-backend-loader.js   (Firebase ou Supabase)
    → la-store.js            (fleet, trips, listeners, vehicles)
    → la-firebase.js OU la-supabase.js
```

| Firebase RTDB | Postgres (Supabase) |
|---------------|---------------------|
| `/users/{uid}/role` | `profiles` |
| `/fleet` | `fleet` |
| `/motoristas` | `motoristas` |
| `/unidades` | `unidades` |
| `/vehicles/{id}` | `vehicles` |
| `/trips` | `trips` |
| `/vehicle_issues` | `vehicle_issues` |
| `/vehicle_maintenance/{vehicleId}` | `vehicle_maintenance` (flat + `vehicle_id`) |

Viagem final usa RPC `persistir_viagem_final` (status + odômetro + trip numa transação).

---

## 4. Teste (checklist)

- [ ] Login motorista + gestor (papéis em `profiles`)
- [ ] Fleet / motoristas / unidades carregam
- [ ] Corrida: status → GPS → finalizar → trip no painel
- [ ] Alerta veículo + resolver no painel
- [ ] Manutenção (app + painel)
- [ ] APK: `BUILD-APK.bat` + celular
- [ ] Bump `sw.js` após deploy (cache v76+)

---

## 5. Migração de histórico (opcional)

Para importar dados do Firebase RTDB:

1. Export JSON no Firebase Console
2. Rode localmente (nunca commitar service role key):

```bash
node scripts/migrate-firebase-to-supabase.mjs caminho/export.json
```

Variáveis de ambiente:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Se preferir começar limpo: só `schema.sql` + `seed.sql` + usuários Auth.

---

## 6. Cutover produção

1. Branch `supabase/migracao` testada
2. Anon key e usuários prontos
3. `la-config.js` no deploy com `BACKEND = 'supabase'` (GitHub Pages: arquivo local no build ou secret no CI)
4. Merge para `main` após checklist

Rollback: voltar `BACKEND = 'firebase'` em `la-config.js`.
