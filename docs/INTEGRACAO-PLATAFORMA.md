# Integração webhook — plataforma L.A.

O app envia eventos para um endpoint HTTP configurado em `la-config.js`.

---

## Configuração

```javascript
window.LA_CONFIG.WEBHOOK_URL = 'https://api.sua-plataforma.com.br/webhooks/la-controle';
window.LA_CONFIG.PLATAFORMA_API_KEY = 'seu-token-opcional';
window.LA_CONFIG.AMBIENTE = 'homolog';
```

- Se `WEBHOOK_URL` estiver vazio, nenhum POST é enviado.
- Falha de rede **não** impede salvar no Supabase.

---

## Formato do POST

- **Método:** `POST`
- **Content-Type:** `application/json`
- **Authorization (opcional):** `Bearer {PLATAFORMA_API_KEY}`

### Envelope comum

```json
{
  "origem": "la-controle-frota",
  "versao": "1.0",
  "evento": "viagem_finalizada",
  "enviadoEm": "2026-05-28T14:30:00.000Z",
  "usuarioUid": "UEcO1odIgRNL5M6Hfxbb9FhKpsd2",
  "usuarioEmail": "motorista@empresa.com",
  "dados": { }
}
```

---

## Evento: `viagem_finalizada`

Disparado após `laPersistirViagemFinal()`.

```json
{
  "evento": "viagem_finalizada",
  "dados": {
    "tripId": "-OXabc123",
    "vehicleId": "UNO",
    "trip": {
      "car": "UNO VIVACE",
      "driver": "Marco",
      "km": 12.45,
      "time": "00:18:32",
      "date": "28/05/2026, 11:30:00",
      "destino": "Stuttgart",
      "destinoId": "vila-olimpia",
      "motivoCorrida": "Entrega peça",
      "problemaVeiculo": null,
      "path": [[-23.61, -46.66], [-23.59, -46.68]]
    }
  }
}
```

**Nota:** `path` pode ser grande (centenas de pontos). O servidor pode ignorar ou armazenar resumo.

---

## Evento: `alerta_veiculo`

Disparado após `laSalvarProblemaVeiculo()`.

```json
{
  "evento": "alerta_veiculo",
  "dados": {
    "issueId": "-OXissue456",
    "vehicleId": "MONTANA",
    "vehicleName": "MONTANA",
    "driver": "Fabio",
    "tipos": ["freio", "barulho"],
    "descricao": "Barulho ao frear",
    "urgencia": "atencao",
    "status": "aberto",
    "date": "28/05/2026, 10:15:00"
  }
}
```

Valores de `urgencia`: `leve`, `atencao`, `nao_usar`.

---

## Resposta esperada

- **2xx** — sucesso (corpo livre)
- **4xx/5xx** — app registra aviso no console; dados já estão no Supabase

Recomenda-se idempotência por `tripId` / `issueId` no servidor L.A.

---

## Teste local com webhook.site

1. Abra [webhook.site](https://webhook.site) e copie a URL única
2. Cole em `LA_CONFIG.WEBHOOK_URL`
3. Finalize uma viagem no app
4. Verifique o JSON recebido

---

## Próximos passos (fase 2)

- Retry com fila (Edge Function / dead-letter)
- Assinatura HMAC no header (`X-LA-Signature`)
- Pull API (GET viagens) além do push webhook
- SSO: token da plataforma → Supabase Auth (OAuth / custom JWT)
