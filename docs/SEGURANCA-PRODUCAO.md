# Checklist de segurança — produção

Use antes de liberar motoristas e gestores reais.

---

## Firebase Realtime Database

- [ ] Publicar `database.rules.json` no Console → Realtime Database → Regras
- [ ] Confirmar que regra temporária `auth != null` foi removida
- [ ] Testar: motorista **não** lê `/trips` de outros; gestor **não** cria viagem
- [ ] Backup/export periódico dos dados (Console ou script)

## Authentication

- [ ] Um usuário por pessoa (evitar conta compartilhada)
- [ ] Senhas fortes; considerar reset periódico
- [ ] Desativar usuários que saíram (`user-disabled`)
- [ ] Papéis só em `/users/{uid}/role` — gestor altera, motorista não

## Chaves e segredos

- [ ] `la-config.js` no `.gitignore` (ORS_KEY, WEBHOOK_URL, API_KEY)
- [ ] Rotacionar chave OpenRouteService se vazou
- [ ] Webhook da plataforma: HTTPS + validar `Bearer` no servidor
- [ ] Firebase API key é pública no cliente — segurança vem das **regras RTDB**

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
- [ ] Ambiente `homolog` separado antes de `prod`

---

## Publicar regras (passo a passo)

1. Firebase Console → projeto `la-controle`
2. Realtime Database → **Regras**
3. Colar conteúdo de `database.rules.json`
4. **Publicar**
5. Testar login motorista e gestor em abas anônimas
