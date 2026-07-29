# Segurança — L.A. Controle

## O que **não** fazer

| Evitar | Por quê |
|--------|---------|
| Senhas em `.md` / `.html` | Use só Supabase Authentication |
| Commitar `la-config.js` | Contém anon key, ORS, webhook |
| Commitar **service_role** | Acesso total ao banco |

## Login

- Senha **somente** no Supabase Authentication.
- Papel em `profiles` (ver `docs/SUPABASE-PERFIS.md`).

## Chaves

- `SUPABASE_ANON_KEY` — pública no cliente; proteção = **RLS**
- `ORS_KEY` — rotas; não versionar
- Webhook — HTTPS + Bearer no servidor L.A.

## Checklist

- [ ] `la-config.js` no `.gitignore`
- [ ] RLS aplicado (`supabase/schema.sql`)
- [ ] Usuários com `profiles.role` correto
- [ ] Detalhes: `docs/SEGURANCA-PRODUCAO.md`
