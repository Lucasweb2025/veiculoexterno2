# Fase 5 — Spec-driven (L.A. Controle de Frota)

Objetivo: **escrever o comportamento do app antes de codificar** — assim você não programa “no escuro”.

O documento vivo do produto está em: **`LA-CONTROLE-SPEC.md`**

---

## 1. O que é spec-driven?

| Sem spec | Com spec |
|----------|----------|
| “Faz igual Uber” | “Com tela ligada, GPS grava a cada X metros” |
| Discussão vaga | Critério de aceite claro ✅/❌ |
| Retrabalho | Capacitor / painel sabem **o que** entregar |

**Fluxo:**

```
Spec (o que deve fazer) → Código → Teste (Fase 4) → Ajusta spec ou código
```

---

## 2. Formato que usamos

Cada requisito segue:

- **ID** — ex.: `MOT-01`
- **Como** — papel (motorista, gestão)
- **Quero** — ação
- **Para** — objetivo
- **Critérios de aceite** — lista testável

Exemplo real está em `LA-CONTROLE-SPEC.md`.

---

## 3. O que já está especificado (resumo)

| Área | Spec | Status atual |
|------|------|----------------|
| Login Firebase | `AUTH-*` | ✅ Implementado |
| Corrida tela ligada | `MOT-*` | ✅ Testado na rua |
| Corrida tela bloqueada | `MOT-BG-*` | ❌ Web — futuro APK |
| Painel histórico | `PAINEL-*` | ✅ Implementado |
| Segurança | `SEC-*` | ✅ Fase 3 |

---

## 4. Como usar na prática

### Antes de pedir uma feature nova

1. Abra `LA-CONTROLE-SPEC.md`
2. Adicione ou altere o requisito
3. Marque critérios de aceite
4. Só então peça implementação (ou programe você mesmo)

### Exemplos de próximas specs (não codar ainda)

- Filtro de viagens por data no painel
- APK Android com GPS em background
- Dois logins (motorista vs gestão) com e-mails diferentes

---

## 5. Exercício — PAINEL-03 (filtros) ✅ guiado

Spec completa em `LA-CONTROLE-SPEC.md` → seção **PAINEL-03**.

**Passo a passo que usamos:**

1. **Quem** usa? → Gestor  
2. **O quê** quer? → Filtrar lista  
3. **Por quê**? → Achar viagem rápido  
4. **Quais campos** na tela? → motorista, destino, datas  
5. **Critérios** = frases que dão ✅ ou ❌ no teste  

**Sua validação:** leia os critérios em PAINEL-03 e marque se faria sentido para a L.A. (pode sugerir mudança).

---

## 6. Checklist Fase 5

- [ ] Li `LA-CONTROLE-SPEC.md` completo
- [ ] Li **PAINEL-03** e entendi os critérios de aceite
- [ ] Entendo diferença entre requisito e critério de aceite
- [ ] Sei que tela bloqueada está spec como “futuro APK”, não bug web
- [ ] Sei o que é “fora do escopo” (não exportar Excel nesta feature)

---

## Fase 5 — fechamento

Quando o checklist acima estiver ✅, a Fase 5 está **concluída**.

---

## Próximo passo

**Fase 6 — App mobile (Capacitor)** → ver `FASE-6-ESTUDO.md` e `CAPACITOR-PLANO.md`.

Mapa geral da trilha: `TRILHA-ESTUDO.md`.
