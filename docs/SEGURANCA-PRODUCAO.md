# Checklist de segurança — produção

Use antes de liberar motoristas e gestores reais.

---

## Supabase (Postgres + RLS)

- [ ] `supabase/schema.sql` aplicado (RLS ligado em todas as tabelas)
- [ ] Realtime só nas tabelas necessárias (`trips`, `vehicle_issues`, `vehicle_maintenance`, `vehicles`)
- [ ] Testar: motorista não acessa painel; gestor não inicia corrida
- [ ] Backup/export periódico (Dashboard ou `pg_dump`)

## Authentication

- [ ] Um usuário por pessoa (evitar conta compartilhada)
- [ ] Senhas fortes
- [ ] Desativar usuários que saíram
- [ ] Papéis só em `profiles` — ver `SUPABASE-PERFIS.md`

## Chaves e segredos

- [ ] `la-config.js` no `.gitignore` (`SUPABASE_ANON_KEY`, `ORS_KEY`, `WEBHOOK_URL`)
- [ ] Nunca commitar **service_role** key
- [ ] Rotacionar chave OpenRouteService se vazou
- [ ] Webhook: HTTPS + validar `Bearer` no servidor L.A.
- [ ] Anon key é pública no cliente — segurança vem do **RLS**

## App e painel

- [ ] HTTPS em produção (GitHub Pages já usa)
- [ ] Revisar CORS do webhook no backend L.A.
- [ ] Limitar tamanho de `path` em integrações externas se necessário

## Android

- [ ] Assinar APK release (não debug) para distribuição
- [ ] Permissões de localização justificadas na Play Store

## Operação

- [ ] Definir quem é admin/gestor
- [ ] Processo para resolver `vehicle_issues` com urgência `nao_usar`
- [ ] Ambiente `homolog` separado antes de `prod` (projeto Supabase separado recomendado)

---

## Conferir RLS (passo a passo)

1. Dashboard → **Authentication** → usuários de teste
2. SQL → confirmar linhas em `profiles`
3. Testar login motorista e gestor em abas anônimas
4. Advisors: Dashboard → Database → Advisors (ou MCP `get_advisors`)
