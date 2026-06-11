# Checklist de entrega — projeto pronto

Use esta lista antes de passar o projeto ao mentor.

---

## Código (você / repositório)

- [x] App motorista (`index.html`) — login, motorista, veículo, GPS, corrida, alertas
- [x] Painel gestor (`painel.html`) — histórico, filtros, mapa, CSV, alertas
- [x] Firebase compartilhado (`la-firebase.js`) + regras (`database.rules.json`)
- [x] Cadastros dinâmicos (`/motoristas`, `/fleet`) + seed JSON
- [x] Documentação em `docs/`
- [ ] **Push no GitHub** (código atualizado na `main`)
- [ ] GitHub Pages ativo na branch `main`

---

## Firebase Console (5 minutos)

1. **Authentication** — usuários criados (motorista + gestor + admin)
2. **Realtime Database** — importar `docs/firebase-seed-cadastros.json`
3. **Realtime Database → Regras** — colar e publicar `database.rules.json`
4. **users** — cada UID com `role` correto (ver `FIREBASE-PERFIS.md`)

Teste rápido:

- [ ] Login no app com conta **motorista**
- [ ] Login no painel com conta **gestor**
- [ ] Finalizar uma viagem de teste → aparece em `/trips` e no painel

---

## O que enviar ao mentor

Copie e cole no WhatsApp/e-mail:

```
Projeto L.A. Controle de Frota — pronto para integração.

App: https://lucasweb2025.github.io/veiculoexterno2/
Painel: https://lucasweb2025.github.io/veiculoexterno2/painel.html
Código: https://github.com/Lucasweb2025/veiculoexterno2
Firebase: projeto la-controle (te dou acesso no Console)

Dados para integrar:
- /trips — viagens
- /vehicle_issues — alertas de veículo
- /vehicles — frota em tempo real

Documentação: docs/PARA-O-MENTOR.md no repositório.
Integração com a plataforma de vocês fica do lado de vocês.
```

- [ ] Acesso ao Firebase Console concedido ao mentor (ou credenciais de teste)

---

## Opcional (depois)

- [ ] APK instalado em celular de teste
- [ ] `ORS_KEY` em `la-config.js` para rotas no mapa
- [ ] `WEBHOOK_URL` se quiserem push em vez de só ler o Firebase

---

## Não precisa fazer agora

- SSO / login único empresa
- Webhook configurado (mentor integra direto no Firebase)
- Modularizar `index.html`
