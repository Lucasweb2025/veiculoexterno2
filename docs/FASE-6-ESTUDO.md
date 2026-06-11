# Fase 6 — App mobile com Capacitor (L.A. Controle de Frota)

Objetivo: publicar o **mesmo app do motorista** na **Google Play**, sem quebrar o site que já funciona no Chrome.

**Plano prático (comandos):** `CAPACITOR-PLANO.md`  
**Requisito na spec:** `LA-CONTROLE-SPEC.md` → `MOT-BG-01` (GPS com tela bloqueada = Fase 6B, depois)

---

## 1. Por que esta fase vem depois da Fase 5?

| Fase 5 (spec) | Fase 6 (Capacitor) |
|---------------|-------------------|
| Escrevemos *o que* o app deve fazer | Construímos *como* entregar no celular como app instalável |
| `MOT-BG-01` documentado | Fase 6A: APK igual web; Fase 6B: GPS em background |

Você já provou na **Fase 4** que o web funciona com **tela ligada**. A Fase 6 adiciona o **canal Play Store**.

---

## 2. Três formas de usar o mesmo app

```
                    ┌─────────────────────┐
                    │   index.html        │
                    │   (mesma lógica)    │
                    └──────────┬──────────┘
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    Chrome / link          PWA instalado      App Capacitor
    GitHub Pages           (atalho)           (Google Play)
    Tela ligada ✅         Tela ligada ✅      Fase 6A: igual web
                                              Fase 6B: GPS bloqueado ✅
```

**Importante:** o site no GitHub **continua**. Motoristas podem usar link **ou** app da loja.

---

## 3. O que é Capacitor? (explicação)

Capacitor é uma **ponte** entre:

- **Seu HTML/CSS/JS** (o que você já sabe)
- **O sistema Android** (permissões, GPS nativo, Play Store)

Por dentro, o app é uma **WebView** — um Chrome simplificado só para o seu `index.html`.

| Termo | Significado |
|-------|-------------|
| `www/` | Pasta que vira o “site” dentro do APK |
| `android/` | Projeto Gradle que a Play Store compila |
| `cap sync` | Copia `www/` → dentro do Android |
| `AAB` | Arquivo que você envia na Play (não é o APK que manda por WhatsApp) |

---

## 4. O que já montamos no projeto

```
TESTEMOSTRAMAPA/Nova pasta/
├── index.html              ← fonte (motorista)
├── la-firebase.js
├── la-config.js            ← ORS (não vai pro Git)
│
├── la-controle-capacitor/  ← NOVO — app Android
│   ├── package.json
│   ├── capacitor.config.json
│   ├── scripts/sync-www.mjs
│   ├── www/                ← cópia do app (gerada)
│   └── android/            ← projeto Android Studio
│
├── CAPACITOR-PLANO.md      ← checklist dia 5
└── FASE-6-ESTUDO.md        ← este arquivo
```

**ID do app (Play):** `br.com.lacustom.controle`  
**Nome na loja:** L.A. Controle

---

## 5. Passo a passo didático (o que cada passo faz)

### Passo 1 — `npm install` (uma vez)

**O quê:** baixa Capacitor e plugin de geolocation.  
**Por quê:** o Node gerencia ferramentas iguais ao `npm` de outros projetos.

### Passo 2 — `npm run sync:www`

**O quê:** copia `index.html`, `la-firebase.js`, etc. da pasta pai → `www/`.  
**Por quê:** o Android não lê sua pasta inteira; só o que está em `www/`.  
**Você aprende:** **fonte única** no pai; `www/` é espelho para o APK.

### Passo 3 — `npm run cap:sync`

**O quê:** copia `www/` para dentro de `android/.../assets/`.  
**Por quê:** o Android Studio compila esses arquivos dentro do APK.

### Passo 4 — `npm run cap:open`

**O quê:** abre o Android Studio no projeto `android/`.  
**Por quê:** de lá você gera APK (teste) ou AAB (Play).

### Passo 5 — Run no celular

**O quê:** instala o app no aparelho conectado por USB (ou emulador).  
**Teste:** login Firebase, corrida, **tela ligada** — igual Fase 4.

### Passo 6 — Dia 5: conta Play + AAB

**O quê:** conta desenvolvedor Google → enviar AAB → teste interno.  
**Custo:** taxa única ~US$ 25 (não é mensalidade do Capacitor).

---

## 6. O único cambio no `index.html` (e por quê)

No site, o **service worker** (`sw.js`) guarda cache offline.

No APK, cache PWA atrapalha. Por isso:

```javascript
if ('serviceWorker' in navigator) {
    const appNativo = window.Capacitor && window.Capacitor.isNativePlatform();
    if (!appNativo) navigator.serviceWorker.register('sw.js');
}
```

| Onde roda | Service worker |
|-----------|----------------|
| Chrome / GitHub | ✅ registra |
| App Capacitor | ❌ não registra |

**O site público não muda de comportamento.**

---

## 7. Fase 6A vs Fase 6B

| | Fase 6A (agora) | Fase 6B (depois) |
|--|-----------------|------------------|
| Objetivo | App na Play, mesmo comportamento web | GPS com **tela apagada** |
| GPS | `navigator.geolocation` (web) | Plugin nativo + notificação |
| Tela bloqueada | Pausa GPS → **linha reta** no painel ao voltar | Deve **continuar** gravando pontos |
| Km | Pode parecer ok em trecho curto (teste 09/06) | Deve refletir trecho com tela apagada |
| Risco | Baixo | Médio (permissões Android) |
| Site web | Intocado | Intocado (`if` nativo no código) |

### O que o teste APK (09/06) provou

```
Tela ligada  → pontos na rua     → km ok ✅
Tela bloqueia → GPS para
Desbloqueia  → liga 2 pontos     → reta no mapa ⚠️
```

**6B resolve isso?** Sim, **para tela apagada com sinal GPS** — o app grava enquanto a tela está off e a linha não “pula” em reta.

**6B não resolve:** metrô/túnel (sem satélite) — isso é `MOT-04`.

Critérios completos: `LA-CONTROLE-SPEC.md` → **MOT-BG-01**.

---

## 8. `capacitor.config.json` — campo importante

```json
"server": { "androidScheme": "https" }
```

**Por quê:** Firebase e geolocation pedem contexto “seguro”. Sem isso, login pode falhar no APK.

---

## 9. Relação com as fases anteriores

| Fase | Ligação com Capacitor |
|------|------------------------|
| 1 CRUD | Mesmos `trips` no Firebase no APK |
| 2 Clean Code | Mesmas funções; depois `if (nativo)` para GPS |
| 3 Security | Mesmo login Firebase no APK |
| 4 Tests | Repetir checklist com app instalado |
| 5 Spec | `MOT-BG-01` guia a Fase 6B |

---

## 10. Checklist Fase 6A (estudo + prática)

- [ ] Li este arquivo e o `CAPACITOR-PLANO.md`
- [ ] Entendo: site web **e** APK podem coexistir
- [ ] `node -v` funciona no PC
- [ ] Android Studio instalado
- [ ] Rodei `npm run cap:open` e vi o projeto
- [ ] App instalado no celular — login ok
- [ ] Corrida de teste com tela ligada ok
- [ ] Sei a diferença entre APK (teste) e AAB (Play)

---

## 11. Próximo passo

| Quando | O quê |
|--------|--------|
| **Até dia 5** | Gerar AAB, checklist Play (`CAPACITOR-PLANO.md`) |
| **Depois** | Fase 6B — GPS background (`MOT-BG-01` documentado ✅) |
| **Sempre** | Nova feature → `LA-CONTROLE-SPEC.md` → código → Fase 4 teste |

---

## Glossário rápido

| Palavra | Em português claro |
|---------|-------------------|
| APK | Arquivo de instalação Android (teste manual) |
| AAB | Pacote para enviar à Google Play |
| WebView | Navegador dentro do app |
| Gradle | Ferramenta que “compila” o Android |
| Play Console | Painel onde você publica o app |
