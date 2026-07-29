# Perfis — motorista, gestor e admin

Login no **Supabase Authentication** (e-mail/senha).  
O **papel** fica na tabela `profiles` (`id` = UUID do Auth).

---

## Papéis

| Papel | App motorista | Painel | Grava viagem |
|-------|---------------|--------|--------------|
| `motorista` | ✅ | ❌ | ✅ |
| `gestor` | ❌ | ✅ | ❌ (só lê / resolve alertas) |
| `admin` | ✅ | ✅ | ✅ (testes / TI) |

---

## Passo 1 — Criar usuário no Auth

1. [Supabase Dashboard](https://supabase.com/dashboard/project/ccysxafhvgqrjlofvavp) → **Authentication** → **Users**
2. **Add user** → e-mail + senha
3. Copie o **UUID** (User UID)

---

## Passo 2 — Papel em `profiles`

No **SQL Editor**:

```sql
insert into public.profiles (id, email, role) values
  ('UUID-DO-USUARIO', 'email@empresa.com', 'admin')
on conflict (id) do update set role = excluded.role, email = excluded.email;
```

Troque `admin` por `motorista` ou `gestor` conforme o caso.

---

## Passo 3 — Testar

| Login | Tela | Resultado |
|-------|------|-----------|
| `admin` | App | ✅ |
| `admin` | Painel | ✅ |
| `motorista` | App | ✅ |
| `motorista` | Painel | ❌ mensagem |
| `gestor` | Painel | ✅ |
| `gestor` | App | ❌ mensagem |
| Sem linha em `profiles` | Qualquer | ❌ “sem perfil” |

---

## O que o RLS impede

- Motorista **não apaga** viagem antiga (só cria via RPC)
- Gestor **não grava** GPS nem corrida
- Segurança vem das **policies** em `supabase/schema.sql`

---

## Erro “sem perfil”

Falta a linha em `profiles` com o UUID do Auth. Insira e entre de novo.

Guia completo: `SUPABASE-MIGRACAO.md`.
