# Cadastros no Firebase

Motoristas, frota e unidades podem ser editados sem alterar o código.

---

## Motoristas (`/motoristas`)

Estrutura:

```json
"motoristas": {
  "marco": { "nome": "Marco", "ativo": true },
  "fabio": { "nome": "Fabio", "ativo": true }
}
```

- Chave: identificador interno (slug)
- `ativo: false` remove da lista do app
- Gestor grava; motorista só lê

---

## Frota (`/fleet`)

```json
"fleet": {
  "UNO": {
    "nome": "UNO VIVACE",
    "foto": "https://...",
    "ativo": true
  }
}
```

- `id` da chave deve bater com `/vehicles/{id}` para odômetro e status

---

## Veículos operacionais (`/vehicles`)

Criados/atualizados pelo app durante corridas:

```json
"vehicles": {
  "UNO": { "status": "DISPONÍVEL", "odometer": 12500 }
}
```

---

## Unidades / destinos (`/unidades`)

Opcional. Se vazio, o app usa lista em `UNIDADES_LA` no `index.html`.

```json
"unidades": {
  "hub": {
    "nome": "HUB",
    "nomeCurto": "HUB",
    "endereco": "...",
    "lat": -23.635,
    "lng": -46.718,
    "paradaRota": true
  }
}
```

`paradaRota: true` → aparece no seletor de destino.

---

## Importar seed

Arquivo pronto: `firebase-seed-cadastros.json`

1. Console → Realtime Database → dados
2. Importar JSON (ou colar nós manualmente)
3. **Não** sobrescrever `/users` existentes

---

## Fallback no app

Se `/motoristas` ou `/fleet` não existirem, o app usa valores padrão embutidos (Marco, Fabio / UNO, Montana).
