# L.A. Controle de Frota

App para motoristas e painel para gestores — GPS, viagens, alertas de veículo.

**Firebase:** projeto `la-controle`  
**Repositório:** [github.com/Lucasweb2025/veiculoexterno2](https://github.com/Lucasweb2025/veiculoexterno2)

---

## Links (produção web)

| Tela | URL |
|------|-----|
| App motorista | https://lucasweb2025.github.io/veiculoexterno2/ |
| Painel gestor | https://lucasweb2025.github.io/veiculoexterno2/painel.html |

---

## Para quem vai integrar (mentor / TI)

Leia **`docs/PARA-O-MENTOR.md`** — arquitetura, nós do Firebase e contrato de dados.

Dados principais no Realtime Database:

- `/trips` — viagens finalizadas
- `/vehicle_issues` — alertas de veículo
- `/vehicles` — status e odômetro
- `/motoristas` e `/fleet` — cadastros
- `/users/{uid}/role` — perfil (`motorista`, `gestor`, `admin`)

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
assets/css/                — CSS publicado (npm run sync:assets)
assets/js/                   — JS publicado (utils.js)
index.html, painel.html    — telas web
src/shared/firebase/la-firebase.js  — auth e banco (fonte)
assets/js/                            — publicado (firebase + utils)
la-integracao.js                      — webhook (opcional)
database.rules.json        — regras Firebase (publicar no Console)
docs/                      — documentação (+ REFATORACAO-PLANO.md)
la-controle-capacitor/     — projeto Android
scripts/sync-assets.mjs    — copia CSS para assets/
```

Refatoração em andamento: ver **`docs/REFATORACAO-PLANO.md`**.

```bash
npm run sync:assets   # após editar src/styles/
```

---

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `docs/PARA-O-MENTOR.md` | Entrega para integração |
| `docs/FIREBASE-PERFIS.md` | Login e papéis |
| `docs/CADASTRO-FIREBASE.md` | Motoristas, frota, unidades |
| `docs/firebase-seed-cadastros.json` | Dados iniciais para importar |
| `docs/SEGURANCA-PRODUCAO.md` | Checklist go-live |
| `TRABALHO-UNICO.md` | Fluxo de trabalho da equipe |
