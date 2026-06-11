# L.A. Controle de Frota — pacote para integração

Documento de entrega para o mentor / equipe de plataforma L.A.

| | |
|--|--|
| **App** | https://lucasweb2025.github.io/veiculoexterno2/ |
| **Painel** | https://lucasweb2025.github.io/veiculoexterno2/painel.html |
| **Código** | [github.com/Lucasweb2025/veiculoexterno2](https://github.com/Lucasweb2025/veiculoexterno2) |
| **Firebase** | projeto `la-controle` |
| **Pasta do código** | `veiculoexterno2/` |

> O app e o painel já estão prontos. A integração com a plataforma L.A. fica com a equipe de vocês — leiam os dados no Firebase ou usem o webhook opcional (`INTEGRACAO-PLATAFORMA.md`).

---

## O que é

Sistema de controle de frota com:

| Componente | Arquivo | Função |
|------------|---------|--------|
| App motorista | `index.html` | Login, escolha motorista/veículo, GPS, corrida, alertas de veículo |
| Painel gestor | `painel.html` | Histórico, filtros, mapa da rota, alertas, export CSV |
| Firebase compartilhado | `la-firebase.js` | Auth, perfis, persistência de viagens e alertas |
| Integração webhook | `la-integracao.js` | POST para plataforma L.A. ao finalizar viagem ou reportar problema |
| Regras RTDB | `database.rules.json` | Segurança por papel (motorista / gestor / admin) |
| Android (APK) | `la-controle-capacitor/` | Capacitor + GPS nativo |

---

## Arquitetura (visão rápida)

```
[App motorista / Painel]  →  Firebase Auth + Realtime Database
         │
         └── la-integracao.js  →  POST webhook (plataforma L.A.)
```

Dados principais no Realtime Database:

| Nó | Quem grava | Quem lê |
|----|------------|---------|
| `/users/{uid}/role` | gestor/admin | todos autenticados (próprio perfil) |
| `/trips` | motorista (criação) | gestor |
| `/vehicles/{id}` | motorista (status, posição, odômetro) | motorista + gestor |
| `/vehicle_issues` | motorista (criação) | motorista + gestor |
| `/motoristas` | gestor | motorista + gestor |
| `/fleet` | gestor | motorista + gestor |
| `/unidades` | gestor | motorista + gestor |

---

## Perfis de acesso

Ver `FIREBASE-PERFIS.md`. Resumo:

- **motorista** → só `index.html`
- **gestor** → só `painel.html`
- **admin** → ambos

Cadastro no Firebase Console (Authentication) + nó `/users/{uid}/role`.

---

## Integração com a plataforma L.A.

**Guia completo:** `INTEGRACAO-PLATAFORMA.md`

1. Copiar `la-config.example.js` → `la-config.js`
2. Preencher `WEBHOOK_URL` (endpoint que recebe POST JSON)
3. Opcional: `PLATAFORMA_API_KEY` (enviado como `Authorization: Bearer …`)

Eventos disparados automaticamente:

| Evento | Quando |
|--------|--------|
| `viagem_finalizada` | Após salvar em `/trips` |
| `alerta_veiculo` | Após salvar em `/vehicle_issues` |

Se o webhook falhar, os dados **permanecem no Firebase** (integração é best-effort).

---

## Cadastros dinâmicos (motoristas e frota)

Antes eram fixos no HTML. Agora vêm do Firebase:

- `/motoristas` — lista na tela “Quem está dirigindo?”
- `/fleet` — carros com foto e nome no app

**Seed de exemplo:** `firebase-seed-cadastros.json`  
**Como importar:** `CADASTRO-FIREBASE.md`

Sem dados no Firebase, o app usa fallback (Marco, Fabio / UNO, Montana).

---

## Painel — exportação

Botão **Exportar CSV** no painel exporta as viagens **com os filtros atuais** (separador `;`, UTF-8 com BOM para Excel).

Colunas: id, veículo, motorista, destino, motivo, km, duração, data, quantidade de pontos GPS.

---

## Segurança antes de produção

**Checklist:** `SEGURANCA-PRODUCAO.md`

Prioridade:

1. Publicar `database.rules.json` no Firebase Console (substituir regra `auth != null` temporária)
2. Criar usuários por papel (não compartilhar conta admin)
3. Configurar webhook com HTTPS + validação de token no servidor L.A.
4. Não commitar `la-config.js` (chaves ORS e webhook)

---

## SSO / login único empresa

**Não implementado nesta entrega.** Hoje: Firebase Email/Password.

Para SSO (Google Workspace, SAML, custom token da plataforma L.A.):

1. Mentor define provedor (Firebase Auth + Custom Token ou OAuth)
2. Mapear usuário da plataforma → `/users/{uid}/role`
3. Substituir telas de login em `index.html` e `painel.html` por fluxo unificado

Podemos fazer em fase 2 assim que houver spec da API de identidade da plataforma.

---

## Ambientes

| Config | Onde |
|--------|------|
| `LA_CONFIG.AMBIENTE` | `la-config.js` (`dev` / `homolog` / `prod`) |
| Firebase | Um projeto por ambiente (recomendado) ou prefixo nos nós (não usado hoje) |
| GitHub Pages | Deploy web atual |
| APK | `la-controle-capacitor` → Android Studio |

---

## Como rodar localmente

1. Clonar o repositório
2. `cp la-config.example.js la-config.js` e preencher `ORS_KEY` (rotas no mapa)
3. Servir a pasta (Live Server, `npx serve`, ou GitHub Pages)
4. Login com usuário cadastrado no Firebase

**APK:** ver `CAPACITOR-PLANO.md` — build fora do OneDrive se Gradle travar.

---

## Documentação adicional

| Arquivo | Conteúdo |
|---------|----------|
| `LA-CONTROLE-SPEC.md` | Especificação funcional completa |
| `INTEGRACAO-PLATAFORMA.md` | Contrato JSON do webhook |
| `CADASTRO-FIREBASE.md` | Motoristas, frota, unidades |
| `FIREBASE-PERFIS.md` | Papéis e regras |
| `SEGURANCA-PRODUCAO.md` | Checklist go-live |
| `TRABALHO-UNICO.md` | Fluxo de trabalho da equipe |

---

## Contato técnico / dúvidas

Lucas — repositório e Firebase `la-controle` já configurados para testes.  
Para conectar à plataforma L.A.: enviar URL do webhook + formato de resposta esperado.
