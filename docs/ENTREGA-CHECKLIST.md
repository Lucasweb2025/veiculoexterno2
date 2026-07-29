# Checklist de entrega — projeto pronto

Use esta lista antes de passar o projeto ao mentor.

---

## Código (você / repositório)

- [x] App motorista (`index.html`) — login, motorista, veículo, GPS, corrida, alertas
- [x] Painel gestor (`painel.html`) — histórico, filtros, mapa, CSV, alertas
- [x] Backend Supabase (`la-supabase.js` + `la-store.js`) + `supabase/schema.sql`
- [x] Cadastros dinâmicos (`motoristas`, `fleet`, `unidades`) + `seed.sql`
- [x] Documentação em `docs/`
- [x] Push no GitHub (`main`)
- [ ] GitHub Pages com `la-config.js` de deploy (anon key — não versionar)

---

## Supabase Dashboard (5 minutos)

1. **Authentication** — usuários criados (motorista + gestor + admin)
2. **SQL** — `schema.sql` + `seed.sql`
3. **Realtime** — `trips`, `vehicle_issues`, `vehicle_maintenance`, `vehicles`
4. **profiles** — cada UUID com `role` correto (ver `SUPABASE-PERFIS.md`)

Teste rápido:

- [ ] Login no app com conta **motorista**
- [ ] Login no painel com conta **gestor**
- [ ] Finalizar uma viagem de teste → aparece em `trips` e no painel

---

## O que enviar ao mentor

```
Projeto L.A. Controle de Frota — pronto para integração.

App: https://lucasweb2025.github.io/veiculoexterno2/
Painel: https://lucasweb2025.github.io/veiculoexterno2/painel.html
Código: https://github.com/Lucasweb2025/veiculoexterno2
Supabase: https://ccysxafhvgqrjlofvavp.supabase.co

Dados para integrar:
- trips — viagens
- vehicle_issues — alertas de veículo
- vehicles — frota em tempo real

Documentação: docs/PARA-O-MENTOR.md e docs/SUPABASE-MIGRACAO.md
Integração com a plataforma de vocês fica do lado de vocês (webhook ou leitura no Postgres).
```

- [ ] Convidar mentor no projeto Supabase (ou credenciais de teste)

---

## Opcional (depois)

- [ ] APK instalado em celular de teste
- [ ] `ORS_KEY` em `la-config.js` para rotas no mapa
- [ ] `WEBHOOK_URL` se quiserem push além de ler o banco

---

## Não precisa fazer agora

- SSO / login único empresa
- Webhook obrigatório (mentor pode ler Postgres direto)
