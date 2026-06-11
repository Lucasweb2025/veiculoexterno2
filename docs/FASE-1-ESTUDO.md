# Fase 1 — Fundamentos (fechamento)

Material de estudo baseado no app **L.A. Controle de Frota**.

---

## 1) Mapa CRUD do app (tela → Firebase → painel)

| Ação do usuário | Operação CRUD | Onde no código | Recurso Firebase |
|---|---|---|---|
| Login | Auth Firebase | `laEntrar` / `laObservarAuth` | Firebase Authentication |
| Carregar unidades | READ | `db.ref('unidades').once('value')` | `/unidades` |
| Iniciar corrida | UPDATE status | `db.ref('vehicles/{id}/status').set('EM MOVIMENTO')` | `/vehicles/{id}/status` |
| Durante corrida (GPS) | UPDATE posição | `db.ref('vehicles/{id}/last_pos').set(...)` | `/vehicles/{id}/last_pos` |
| Finalizar corrida | CREATE viagem + UPDATE odômetro | `db.ref('trips').push(trip)` + `transaction` | `/trips`, `/vehicles/{id}/odometer` |
| Painel lista viagens | READ | `db.ref('trips').on('value')` | `/trips` |
| Backup local | CREATE/UPDATE backup | `localStorage.setItem(TRIP_BACKUP_KEY, JSON)` | navegador |

**Regra mental:** `push` cria novo, `once` lê, `set` atualiza campo fixo.

---

## 2) Contrato JSON da viagem (`trip`)

Campos que o app grava hoje (e significado):

```json
{
  "car": "MONTANA",
  "driver": "Marco",
  "km": 12.45,
  "time": "00:18",
  "date": "28/05/2026, 10:30:00",
  "path": [[lat, lng], ...],
  "destino": "HUB",
  "destinoId": "hub",
  "motivoCorrida": "Entrega de material"
}
```

| Campo | Obrigatório | Tipo | Observação |
|---|---|---|---|
| `car` | sim | string | Nome do veículo |
| `driver` | sim | string | Motorista |
| `km` | sim | number | Quilometragem final |
| `time` | sim | string | Duração |
| `date` | sim | string | Data/hora local BR |
| `path` | sim | array | Coordenadas do trajeto |
| `destino` | recomendado | string | Nome curto (ex.: Stuttgart) |
| `destinoId` | recomendado | string | id interno (hub, mclaren, etc.) |
| `motivoCorrida` | recomendado | string | Motivo da corrida |

---

## 3) Fluxo HTTP no projeto

### Quando usa HTTP (rede externa)
- **OpenRouteService** — `fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', ...)`
  - Método: `POST`
  - Body: JSON com coordenadas
  - Uso: rota planejada + ajuste de trajeto nas ruas

### Quando usa Firebase (sem ser HTTP de mapa)
- Leitura/escrita de unidades, status, viagens, odômetro, `last_pos`
- SDK Firebase faz a comunicação (não é REST clássico no seu código, mas é troca de dados na internet)

### Quando usa apenas local (sem rede para salvar)
- `localStorage` — backup da corrida em andamento
- Se cair internet antes de finalizar, tenta salvar depois ao reconectar

---

## Checklist de revisão (você mesmo)

- [ ] Consigo explicar diferença entre **CREATE**, **READ**, **UPDATE**
- [ ] Sei onde está o `push` da viagem
- [ ] Sei onde está o `once` de leitura
- [ ] Sei quando o app chama API externa (`fetch`) vs Firebase

---

## Próximo passo

**Fase 2 — Clean Code & Patterns** → ver `FASE-2-ESTUDO.md`.

**Fase 3 — Security** → ver `FASE-3-ESTUDO.md`.

**Fase 4 — Tests** → concluída, ver `FASE-4-ESTUDO.md` (fechamento).

**Fase 5 — Spec-driven** (próxima na trilha).