# Supabase — backend do L.A. Controle

Guia do projeto Supabase do L.A. Controle (`veiculoexterno2`).

**Projeto:** https://ccysxafhvgqrjlofvavp.supabase.co  

O app usa **somente Supabase** (Auth + Postgres + Realtime).

---

## 1. Dashboard Supabase

### API (Settings → API)

1. Copie **Project URL** → `LA_CONFIG.SUPABASE_URL`
2. Copie **anon public key** → `LA_CONFIG.SUPABASE_ANON_KEY` em `la-config.js` (não commitar)

### Authentication (Authentication → Providers)

1. Habilite **Email / Password**
2. Crie usuários (motorista, gestor, admin)

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

---

## 2. Configuração local (`la-config.js`)

Copie de `la-config.example.js`:

```javascript
window.LA_CONFIG.SUPABASE_URL = 'https://ccysxafhvgqrjlofvavp.supabase.co';
window.LA_CONFIG.SUPABASE_ANON_KEY = 'eyJ...'; // anon key do dashboard
```

---

## 3. Arquitetura no código

```
index.html / painel.html
    → la-backend-loader.js
    → la-supabase.js + la-store.js
    → Supabase Auth / Postgres / Realtime
```

| Tabela | Uso |
|--------|-----|
| `profiles` | papéis |
| `fleet` / `motoristas` / `unidades` | cadastros |
| `vehicles` | status, odômetro, last_pos |
| `trips` | viagens |
| `vehicle_issues` | alertas |
| `vehicle_maintenance` | manutenção |

Viagem final usa RPC `persistir_viagem_final`.

---

## 4. Teste (checklist)

- [ ] Login motorista + gestor (papéis em `profiles`)
- [ ] Fleet / motoristas / unidades carregam
- [ ] Corrida: status → GPS → finalizar → trip no painel
- [ ] Alerta veículo + resolver no painel
- [ ] Manutenção (app + painel)
- [ ] APK: `BUILD-APK.bat` + celular
- [ ] Cache: `sw.js` v77+

---

## 5. Import histórico (opcional)

Se ainda tiver export do Firebase RTDB antigo:

```bash
node scripts/migrate-firebase-to-supabase.mjs caminho/export.json
```

Variáveis: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (só local, nunca commit).
