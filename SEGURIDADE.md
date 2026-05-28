# Segurança — antes do push no GitHub

## O que NÃO deve ir pro repositório

| Arquivo | Conteúdo |
|---------|----------|
| `la-config.js` | Chave OpenRouteService (`ORS_KEY`) |
| `.env` | Qualquer segredo |
| Senhas em `.md` / `.html` | Use só Firebase Console |

O `.gitignore` já bloqueia `la-config.js`.

## Login do app

- Senha **somente** no Firebase Authentication (usuário `admin@lacustom.test` ou o que você cadastrou).
- Se o repositório já teve senha fixa no HTML no passado: **troque a senha** no Firebase Console e gere **nova chave ORS** no OpenRouteService.

## Configurar ORS localmente

```bash
copy la-config.example.js la-config.js
```

Edite `la-config.js` e coloque sua `ORS_KEY` (só na sua máquina).

## GitHub Pages (repositório público)

O arquivo `la-config.js` não sobe no Git. Duas opções:

1. **GitHub Actions** — em Settings → Secrets → `ORS_KEY`, use o workflow em `.github/workflows/pages.yml` (gera `la-config.js` no deploy).
2. **Sem Actions** — o app funciona com GPS bruto; snap/rotas ORS ficam desativados até configurar deploy com secret.

## Firebase

- Publique regras `auth != null` (`database.rules.json`).
- Não use senha fixa no HTML.
