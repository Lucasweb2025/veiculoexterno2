# L.A. Controle de Frota

App para motoristas e painel para gestores — GPS, viagens, alertas de veículo.

**Backend:** [Supabase](https://ccysxafhvgqrjlofvavp.supabase.co) (Auth + Postgres + Realtime)  
**Repositório:** [github.com/Lucasweb2025/veiculoexterno2](https://github.com/Lucasweb2025/veiculoexterno2)  
**PR / validação:** [#1 — Migração Supabase](https://github.com/Lucasweb2025/veiculoexterno2/pull/1)

---

## Links (web)

| Tela | URL |
|------|-----|
| App motorista | https://lucasweb2025.github.io/veiculoexterno2/ |
| Painel gestor | https://lucasweb2025.github.io/veiculoexterno2/painel.html |

> Em produção web, o deploy precisa de `la-config.js` local (não versionado) com a anon key do Supabase.

---

## Para quem vai integrar (mentor / TI)

Leia **`docs/PARA-O-MENTOR.md`** e **`docs/SUPABASE-MIGRACAO.md`**.

Tabelas principais:

| Tabela | Uso |
|--------|-----|
| `profiles` | papéis (`motorista`, `gestor`, `admin`) |
| `fleet` / `motoristas` / `unidades` | cadastros |
| `vehicles` | status, odômetro, posição |
| `trips` | viagens finalizadas |
| `vehicle_issues` | alertas de veículo |
| `vehicle_maintenance` | revisão / manutenção |

Webhook opcional (`la-integracao.js`) — ativa se `WEBHOOK_URL` estiver em `la-config.js`.

---

## Configuração local

```bash
cp la-config.example.js la-config.js
```

Em `la-config.js`:

1. `SUPABASE_URL` + `SUPABASE_ANON_KEY` (Dashboard → Settings → API)
2. `ORS_KEY` — opcional (rotas no mapa)

Abra `index.html` ou `painel.html` no navegador (Live Server).

Papéis: cadastre usuários no **Supabase Auth** e linhas em `profiles` (ver `docs/SUPABASE-MIGRACAO.md`).

```bash
npm run sync:assets   # após editar arquivos em src/
```

---

## APK Android

```bash
BUILD-APK.bat
```

Ou manualmente:

```bash
cd la-controle-capacitor
npm install
npm run cap:sync
npx cap open android
```

Android Studio → **Build → Build APK**.  
Se o Gradle travar no OneDrive, copie o projeto para `C:\Projetos\`.

---

## Estrutura

```
src/shared/supabase/   — auth e persistência
src/shared/la-store.js — fleet, trips, listeners
src/motorista/         — mapa, GPS, corrida
supabase/schema.sql    — Postgres + RLS
supabase/seed.sql      — cadastros iniciais
index.html             — app motorista
painel.html            — painel gestor
la-config.example.js   — modelo de config (segredos fora do Git)
```

---

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `docs/PARA-O-MENTOR.md` | Entrega para integração |
| `docs/SUPABASE-MIGRACAO.md` | Setup Supabase (schema, Auth, Realtime) |
| `docs/SEGURANCA-PRODUCAO.md` | Checklist go-live |
| `docs/REFATORACAO-PLANO.md` | Etapas da refatoração |
| `TRABALHO-UNICO.md` | Fluxo de trabalho da equipe |
