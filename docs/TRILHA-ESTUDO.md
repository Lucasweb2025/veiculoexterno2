# Trilha de estudo — L.A. Controle de Frota

Mapa das fases do projeto. Cada fase tem um `.md` com explicação + checklist.

| Fase | Tema | Arquivo | Status |
|------|------|---------|--------|
| 1 | Fundamentos (HTTP, CRUD, JSON) | `FASE-1-ESTUDO.md` | ✅ |
| 2 | Clean Code (funções, SRP) | `FASE-2-ESTUDO.md` | ✅ |
| 3 | Security (Firebase Auth, regras) | `FASE-3-ESTUDO.md` | ✅ |
| 4 | Tests (teste de rua) | `FASE-4-ESTUDO.md` | ✅ |
| 5 | Spec-driven (requisitos) | `FASE-5-ESTUDO.md` | ✅ |
| 6 | App mobile (Capacitor + Play) | `FASE-6-ESTUDO.md` | ▶ agora |
| — | Spec viva do produto | `LA-CONTROLE-SPEC.md` | atualizar sempre |
| — | Plano operacional Play | `CAPACITOR-PLANO.md` | checklist dia 5 |

**Código principal:** `index.html` (motorista), `painel.html` (gestão), `la-firebase.js`  
**Deploy web:** repositório `veiculoexterno2` (GitHub Pages)  
**App Android:** pasta `la-controle-capacitor/`

---

## Ordem recomendada (estudo + produto)

```
Fase 1 → 2 → 3 → 4 → 5 → 6
         ↓
    código do app evolui junto
```

**Regra:** depois da Fase 5, toda feature nova começa em `LA-CONTROLE-SPEC.md` → depois código → depois teste (Fase 4 de novo).
