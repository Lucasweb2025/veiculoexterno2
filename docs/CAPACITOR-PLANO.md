# Plano Capacitor — L.A. Controle (até publicação Play)

Pasta do projeto Android: `la-controle-capacitor/`

**Estudo (explicação passo a passo):** `FASE-6-ESTUDO.md`  
**Mapa da trilha:** `TRILHA-ESTUDO.md`

**Fase 6A (agora):** mesmo app web dentro do APK — **não muda** o site no GitHub.  
**Fase 6B:** GPS com tela bloqueada (plugin nativo) — ✅ aprovado em campo 09/06/2026.

---

## O que NÃO muda

| Item | Situação |
|------|----------|
| Site `lucasweb2025.github.io/veiculoexterno2` | Continua igual |
| Painel web | Continua no GitHub |
| Uso pelo Chrome | Tela ligada, como hoje |

O APK é **outro canal** de instalação do mesmo `index.html`.

---

## Pré-requisitos no PC

- [ ] [Node.js LTS](https://nodejs.org/) instalado (`node -v`)
- [ ] [Android Studio](https://developer.android.com/studio) instalado
- [ ] Copiar `la-config.js` para `la-controle-capacitor/www/` (chave ORS local)

---

## Comandos do dia a dia

Na pasta `la-controle-capacitor`:

```bash
# 1) Copiar HTML/JS da pasta pai para www/
npm run sync:www

# 2) Sincronizar com Android
npm run cap:sync

# 3) Abrir no Android Studio (gerar APK / AAB)
npm run cap:open
```

No Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)** (teste) ou **AAB** (Play Store).

---

## Timeline sugerida

| Quando | Tarefa |
|--------|--------|
| **Agora** | `npm install` na pasta capacitor (feito uma vez) |
| **Antes dia 5** | APK debug no celular, testar login + corrida (tela ligada) |
| **Dia 5** | Conta Google Play ✅ |
| **Agora** | Play Console → AAB assinado → teste interno — ver `GOOGLE-PLAY-GUIA.md` |
| **Depois** | Fase B: GPS background (`MOT-BG-01` na spec) |

---

## Dia 5 — Play Console (checklist)

1. [Google Play Console](https://play.google.com/console) → criar conta desenvolvedor  
2. **Criar app** → nome: L.A. Controle  
3. **Teste interno** (recomendado primeiro) → enviar AAB  
4. Adicionar testadores (e-mails)  
5. Política de privacidade (URL ou texto — Supabase coleta dados de localização)  
6. Ícone 512×512, screenshots (celular)  
7. Quando ok → produção ou teste fechado  

---

## Fase B — GPS tela bloqueada (`MOT-BG-01`) ✅

**Problema (teste APK 09/06):** tela bloqueada → GPS pausa → ao desbloquear, painel mostra **linha reta** (km pode parecer ok).

**Objetivo 6B:** com tela apagada, **continuar gravando** → linha contínua no painel.

- Plugin `@capacitor-community/background-geolocation` ou similar  
- Notificação “Corrida em andamento”  
- Permissão “localização o tempo todo” no Android  
- `ACCESS_BACKGROUND_LOCATION` no manifest  
- Código com `if (Capacitor.isNativePlatform())` — web inalterada  
- Critérios e teste de rua: `LA-CONTROLE-SPEC.md` → MOT-BG-01  

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Tela branca no APK | `npm run sync:www` + `npm run cap:sync` |
| Supabase não loga | `androidScheme: https` no `capacitor.config.json` (já configurado) |
| Sem rota ORS | `www/la-config.js` com `ORS_KEY` |
| GPS não pede / não libera | `ACCESS_FINE_LOCATION` no `AndroidManifest` → gerar APK de novo |
| Gradle lento | Primeira build no Android Studio demora |
