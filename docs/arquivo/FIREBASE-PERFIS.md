# Perfis — motorista, gestor e admin

Login continua no **Authentication** (e-mail/senha).  
O **papel** fica no Realtime Database em `/users/{uid}/role`.

---

## Papéis

| Papel | App motorista | Painel | Grava viagem |
|-------|---------------|--------|--------------|
| `motorista` | ✅ | ❌ | ✅ |
| `gestor` | ❌ | ✅ | ❌ (só lê) |
| `admin` | ✅ | ✅ | ✅ (testes / TI) |

---

## Passo 1 — Seu usuário (admin)

1. **Authentication** → **Users** → copie o **UID** do seu e-mail
2. **Realtime Database** → **Dados** → adicione (se ainda não existir):

```json
{
  "users": {
    "COLE_SEU_UID_AQUI": {
      "role": "admin"
    }
  }
}
```

3. Faça isso **antes** de publicar as regras novas (ou com regras ainda `auth != null`)

---

## Passo 2 — Publicar regras

**Realtime Database** → **Regras** → cole `database.rules.json` do projeto → **Publicar**

---

## Passo 3 — Cadastrar motorista ou gestor

### A) Authentication
**Add user** → e-mail + senha da pessoa

### B) Realtime Database → `/users`
Copie o **UID** do usuário novo e adicione:

```json
"UID_DO_MOTORISTA": { "role": "motorista" }
```

ou

```json
"UID_DO_GESTOR": { "role": "gestor" }
```

**Quem cadastra `/users`:** conta com papel `gestor` ou `admin` (pelo Console no início; depois pode ser só gestor se tiver acesso ao Firebase).

---

## Passo 4 — Testar

| Login | Tela | Resultado |
|-------|------|-----------|
| `admin` | App | ✅ |
| `admin` | Painel | ✅ |
| `motorista` | App | ✅ |
| `motorista` | Painel | ❌ mensagem |
| `gestor` | Painel | ✅ |
| `gestor` | App | ❌ mensagem |
| Sem `/users/uid` | Qualquer | ❌ “sem perfil” |

---

## O que as regras impedem

- Motorista **não apaga** viagem antiga (só cria nova)
- Gestor **não grava** GPS nem corrida
- Viagens e veículos no RTDB continuam **normais** — só muda quem pode ler/gravar

---

## Erro “sem perfil”

Falta o nó `/users/SEU_UID/role`. Adicione no Console e entre de novo.
