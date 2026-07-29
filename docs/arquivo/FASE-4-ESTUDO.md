# Fase 4 — Tests (L.A. Controle de Frota)

Objetivo: **provar que o app funciona** antes de mudar código ou criar app nativo (Capacitor).

Ordem: **testes manuais na rua** → depois testes automáticos das regras puras.

---

## 1. Por que testar?

| Sem teste | Com teste |
|-----------|-----------|
| “Acho que funciona” | “Sei o que funciona e o que quebrou” |
| Bug na rua sem explicação | Passo que falhou anotado |
| Medo de mexer no código | Confiança para Fase 5 e Capacitor |

---

## 2. Tipos de teste (neste projeto)

| Tipo | O que é | Quando usar |
|------|---------|-------------|
| **Manual** | Você usa o celular e marca ✅/❌ | Agora — teste de rua |
| **Regressão** | Repetir os mesmos passos após cada push | Antes de liberar para motoristas |
| **Automático (futuro)** | Funções puras testadas no console ou arquivo `.js` | Regras como `validarInicioCorrida` |

GPS em segundo plano **não** entra em teste automático web — só manual ou app nativo depois.

---

## 3. Checklist — teste de rua (motorista)

Marque após cada saída. Use app **instalado** ou Chrome, **tela ligada** durante a corrida.

### Antes de sair
- [x] Internet ok (4G/5G/Wi‑Fi)
- [x] GPS ligado (alta precisão)
- [x] Login com e-mail + senha Firebase
- [x] Página atualizada (última versão do GitHub)

### Fluxo completo — **ida (tela ligada)** ✅
- [x] Escolher **motorista**
- [x] Escolher **veículo** (UNO VIVACE)
- [x] Escolher **destino** (ou Outros)
- [x] Escolher **motivo** da corrida
- [x] **Iniciar corrida** — botão muda para “Finalizar”
- [x] Banner verde “Corrida ativa” aparece
- [x] GPS: sinal bom (~12 m reportado)
- [x] Andar — km subiu; trajeto completo no painel (**Ver Rota**)
- [x] Linha no mapa (leve “tremida” nos cantos — GPS normal, gravidade **baixa**)
- [x] **Finalizar corrida** funcionou
- [x] Viagem salva; painel mostrou rota correta (Moema)

### Rodada 4 — **APK, tela bloqueada** ⚠️ → MOT-BG-01 (Fase 6B)
- [x] Canal: **APK** L.A. Controle (Fase 6A)
- [x] Andou com tela ligada — **km ok**
- [x] Bloqueou aparelho — GPS parou de gravar pontos
- [x] Ao desligar bloqueio: painel **Ver rota** mostra **linha reta** do último ponto até posição atual
- **Conclusão:** 6A **não** resolve tela apagada; **6B** deve manter gravação e linha contínua (com GPS no ar)
- **Reteste 6B (09/06/2026):** ✅ tela bloqueada, km ok, **Ver rota** segue ruas no painel (Uno Vivace)

### Rodada 3 — **metrô (tela ligada, Chrome)** ⚠️ → MOT-04
- [x] Moema (Aliaw) → estação a pé: trajeto OK até a estação
- [x] Entrou no metrô: sinal GPS caiu (normal)
- [ ] Ao descer (Vila das Belezas): marcador **travou** no último ponto — não recuperou
- **Causa:** perda de sinal com app em primeiro plano; código só retomava ao **desbloquear** tela
- **Correção:** `MOT-04` em `index.html` — monitor a cada 15 s, reinicia GPS após ~45 s sem ponto
- **Reteste:** repetir trajeto após publicar no GitHub Pages

### Rodada 2 — **volta (tela bloqueada)** ⚠️
- [x] Teste feito: motivo “Teste de volta + bloqueio da tela”
- [x] Viagem **salvou** no painel (28/05/2026, 15:54)
- [ ] GPS com tela bloqueada — **não aprovado**: só **~0,07 km** e trecho curto no mapa
- **Conclusão:** app web **não** substitui app nativo com tela apagada; uso operacional = **tela ligada**

---

## 4. Checklist — painel (gestão)

- [x] Login mesmo e-mail/senha
- [x] Viagens de teste aparecem no histórico (ida + volta)
- [x] Km, motorista e motivo corretos
- [x] **Ver Rota** abre mapa com trajeto (ida completa; volta parcial)

---

## 5. Registro de bugs (copie e preencha)

| # | Data | O que fez | Esperado | Aconteceu | Gravidade |
|---|------|-----------|----------|-----------|-----------|
| 1 | 28/05/2026 | Ida, tela ligada | Trajeto completo | OK; linha um pouco tremida | **baixa** |
| 2 | 28/05/2026 | Volta, tela bloqueada | Rastrear volta | Só ~0,07 km; GPS pausou | **esperado** (limite PWA) |
| 3 | pós-28/05 | Metrô, tela ligada | GPS volta ao descer | Travou na estação de entrada | **média** → MOT-04 |
| 4 | 09/06/2026 | APK, tela bloqueada | Rota contínua no painel | Linha reta após desbloquear; km ok | **esperado** 6A → **6B** |

**Gravidade:** alta = não dá para usar na frota; média = incomoda; baixa = visual/texto.

---

## 6. Testes das regras (lógica pura)

Funções que dá para testar **sem GPS** (já no `index.html`):

| Função | Entrada | Resultado esperado |
|--------|---------|-------------------|
| `validarInicioCorrida()` | sem destino | mensagem de erro |
| `validarInicioCorrida()` | destino + motivo | `''` (ok) |
| `validarPathMinimoParaFinalizar()` | `path.length < 2` | `false` |
| `validarPathMinimoParaFinalizar()` | `path.length >= 2` | `true` |

**Exercício:** com corrida **não** iniciada, abra o Console (F12 no PC) e rode:

```javascript
validarInicioCorrida()
```

Anote o retorno. Depois selecione destino + motivo e rode de novo.

---

## 7. Quando considerar Fase 4 “ok”

- [x] 1 corrida completa na rua (iniciar → andar → finalizar → painel)
- [x] Login Firebase ok nos dois apps
- [x] Bugs/limites anotados (tremida GPS baixa; bloqueio = limite conhecido)
- [x] Entendo diferença entre teste manual e automático

---

## 8. Fechamento da Fase 4 (28/05/2026)

**Aprovado para uso na frota (web/PWA):**

- Corrida com **tela ligada**
- Login Firebase, finalizar, painel e **Ver Rota**

**Não aprovado (sem APK nativo):**

- Rastreio com **tela bloqueada**

**Regra operacional L.A.:** motorista mantém tela ligada durante a corrida (brilho baixo permitido).

**Evolução futura (fora da Fase 4):** Capacitor/APK Android para GPS em segundo plano.

---

## Próximo passo

**Fase 5 — Spec-driven** → ver `FASE-5-ESTUDO.md` e `LA-CONTROLE-SPEC.md`.
