# Plano de refatoração — ordem segura

Objetivo: código organizado para handoff ao sênior, **sem quebrar** produção (GitHub Pages + APK).

## Princípios

1. Uma etapa por vez — testar motorista, gestor e APK após cada uma.
2. `index.html` e `painel.html` continuam sendo as entradas até a etapa final.
3. Firebase, GPS e corrida são as últimas áreas a modularizar.
4. Fonte em `src/` — deploy em `assets/` e raiz (HTML/JS).

---

## Etapas

| # | Etapa | Risco | Status |
|---|--------|-------|--------|
| 0 | Este documento + `package.json` + `scripts/` | Baixo | ✅ |
| 1 | CSS → `src/styles/` + `assets/css/` | Baixo | ✅ |
| 2 | Utilitários (`escHtml`, `formatarTempo`, datas) → `src/shared/utils.js` | Baixo | ✅ |
| 3 | Firebase → `src/shared/firebase/la-firebase.js` | Baixo | ✅ |
| 4 | Login motorista → `src/motorista/auth.js` | Médio | ✅ |
| 5 | Painel gestor → `src/gestor/gestor-auth.js` | Médio | ✅ |
| 6 | Destinos / mapa (sem GPS de corrida) | Médio | ✅ |
| 7 | Corrida + GPS + backup | Alto | ✅ |
| 8 | Vite bundle (opcional) | Médio | Pendente |

---

## Estrutura alvo

```
veiculoexterno2/
├── src/
│   ├── styles/          ← fonte CSS (etapa 1)
│   ├── shared/
│   │   ├── utils.js
│   │   ├── constants.js
│   │   └── firebase/la-firebase.js
│   ├── motorista/
│   │   ├── motorista-auth.js
│   │   ├── state.js
│   │   ├── destinos.js
│   │   ├── mapa.js
│   │   ├── backup-viagem.js
│   │   ├── gps.js
│   │   └── corrida.js
│   └── gestor/
│       └── gestor-auth.js
├── assets/css/          ← CSS publicado
├── assets/js/           ← JS publicado (firebase, utils, constants, state, destinos, mapa)
├── index.html           ← entrada motorista
├── painel.html          ← entrada gestor
├── la-integracao.js     ← webhook (raiz até etapa futura)
├── scripts/
│   └── sync-assets.mjs
├── docs/
├── la-controle-capacitor/
└── BUILD-APK.bat
```

---

## Comandos

```bash
npm run sync:assets   # src/styles → assets/css
npm run build:web     # alias do sync (por enquanto)
```

Antes de commitar mudanças em CSS: rode `npm run sync:assets`.

APK: `BUILD-APK.bat` (OneDrive) → Android Studio Clean → Run.

---

## Teste após cada etapa

- [ ] Login motorista (GitHub Pages ou local)
- [ ] Fluxo: motorista → veículo → destino → corrida (se etapa ≥ 7)
- [ ] Login gestor + painel
- [ ] `BUILD-APK.bat` + APK no celular

---

## Para o sênior

- Contrato Firebase: `docs/PARA-O-MENTOR.md`
- Regras: `database.rules.json`
- Refatoração em andamento — ver tabela de etapas acima.
