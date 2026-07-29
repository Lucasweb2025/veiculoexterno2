# Cadastros no Supabase

Motoristas, frota e unidades podem ser editados sem alterar o código.

Seed SQL: `supabase/seed.sql`  
Schema: `supabase/schema.sql`

---

## Motoristas (`motoristas`)

```sql
insert into public.motoristas (id, nome, ativo) values
  ('marco', 'Marco', true),
  ('fabio', 'Fabio', true)
on conflict (id) do update set nome = excluded.nome, ativo = excluded.ativo;
```

- `ativo = false` remove da lista do app
- Gestor grava (RLS); motorista só lê

---

## Frota (`fleet`)

```sql
insert into public.fleet (id, nome, foto, ativo) values
  ('UNO', 'UNO VIVACE', 'https://...', true)
on conflict (id) do update set nome = excluded.nome, foto = excluded.foto, ativo = excluded.ativo;
```

- `id` deve bater com `vehicles.id` para odômetro e status

---

## Veículos operacionais (`vehicles`)

```sql
insert into public.vehicles (id, status, odometer) values
  ('UNO', 'DISPONÍVEL', 0)
on conflict (id) do nothing;
```

Atualizados pelo app durante corridas (status, `last_pos`, odômetro).

---

## Unidades / destinos (`unidades`)

Se vazio, o app usa fallback `UNIDADES_LA` no código.

```sql
insert into public.unidades (id, nome, nome_curto, endereco, lat, lng, matriz, parada_rota) values
  ('hub', 'HUB', 'HUB', '...', -23.635, -46.718, false, true)
on conflict (id) do nothing;
```

`parada_rota = true` → aparece no seletor de destino.

---

## Importar seed

1. SQL Editor → rode `supabase/schema.sql` (se ainda não)
2. Rode `supabase/seed.sql`
3. Cadastre usuários Auth + `profiles` (ver `SUPABASE-PERFIS.md`)

---

## Fallback no app

Se `motoristas` ou `fleet` estiverem vazios, o app usa valores padrão (Marco, Fabio / UNO, Montana).
