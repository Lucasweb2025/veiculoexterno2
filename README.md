# L.A. Controle de Frota

App para motoristas e painel para gestores — GPS, viagens, alertas de veículo.

**Supabase:** https://ccysxafhvgqrjlofvavp.supabase.co  
**Repositório:** [github.com/Lucasweb2025/veiculoexterno2](https://github.com/Lucasweb2025/veiculoexterno2)

---

## Links (produção web)

| Tela | URL |
|------|-----|
| App motorista | https://lucasweb2025.github.io/veiculoexterno2/ |
| Painel gestor | https://lucasweb2025.github.io/veiculoexterno2/painel.html |

---

## Para quem vai integrar (mentor / TI)

Leia **`docs/PARA-O-MENTOR.md`** e **`docs/SUPABASE-MIGRACAO.md`**.

Tabelas principais:

- `trips` — viagens finalizadas
- `vehicle_issues` — alertas de veículo
- `vehicles` — status e odômetro
- `motoristas` e `fleet` — cadastros
- `profiles` — perfil (`motorista`, `gestor`, `admin`)

Webhook opcional (`la-integracao.js`) — só ativa se `WEBHOOK_URL` estiver em `la-config.js`.

---

## Configuração local

```bash
cp la-config.example.js la-config.js
# Edite ORS_KEY (rotas no mapa) — opcional para teste básico
```

Abra `index.html` ou `painel.html` no navegador (ou use Live Server).

Perfis de login: ver **`docs/FIREBASE-PERFIS.md`**.

---

## APK Android

```bash
cd la-controle-capacitor
npm install
npm run cap:sync
npx cap open android
```

Android Studio → **Build → Build APK**.  
Se o Gradle travar no OneDrive, copie `la-controle-capacitor` para `C:\Projetos\`.

---

## Estrutura

```
src/styles/                — fonte CSS (editar aqui)
src/shared/utils.js        — utilitários compartilhados
src/shared/supabase/       — auth Supabase
src/shared/la-store.js     — CRUD + Realtime
assets/css/ / assets/js/   — publicados (npm run sync:assets)
index.html, painel.html    — telas web
la-integracao.js           — webhook (opcional)
supabase/schema.sql        — Postgres + RLS
docs/                      — documentação
la-controle-capacitor/     — projeto Android
```

```bash
npm run sync:assets   # após editar src/
```

---

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `docs/PARA-O-MENTOR.md` | Entrega para integração |
| `docs/SUPABASE-MIGRACAO.md` | Setup Supabase |
| `docs/SEGURANCA-PRODUCAO.md` | Checklist go-live |
| `TRABALHO-UNICO.md` | Fluxo de trabalho da equipe |
