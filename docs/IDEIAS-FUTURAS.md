# Ideias futuras — L.A. Controle de Frota

Documento de referência (não implementado ainda). Atualizado em maio/2026.

---

## 1. Mapa regional offline + perímetro L.A.

**Conceito:** Em vez do mapa mundial online, definir uma área de operação (círculo ou retângulo em torno da sede Moema + rotas habituais) e guardar só essa região no celular.

**Fluxo desejado:**
- Instalar/atualizar o app na sede (Wi‑Fi) → baixa pacote de mapa da região (tiles ou PMTiles).
- Motorista escolhe destino (Stuttgart, McLaren, HUB, Sede, Outros).
- **Iniciar corrida** → GPS do celular forma a linha no mapa (offline ou online).
- **Finalizar** → salva linha + km + motorista + destino no Firebase.

**Camadas:**
| Camada | Função | Offline? |
|--------|--------|----------|
| GPS | Posição lat/lng | Sim (sem internet) |
| Linha + km | Pontos, distância, histórico | Salvar precisa internet* |
| Mapa de fundo | Visual das ruas | Pode ser offline na região |

\* Possível fila local “salvar quando tiver rede”.

**Perímetro (exemplo):** centro Moema (Imarés 398), raio ~15–25 km. Fora do círculo: aviso opcional ou só linha sem tiles.

**Implementação sugerida (fases):**
- A — Fundo cinza + linha GPS (sem tiles offline).
- B — Geofence / aviso fora da área.
- C — Cache de tiles ou Protomaps PMTiles só da região SP sul/oeste.
- D — Sync de viagem offline se sem rede ao finalizar.

**Forma correta de tiles offline:** Geofabrik/OSM + gerar tiles (não scrapear servidor Carto em massa).

---

## 2. UI destinos — implementado

- Ao clicar um destino: **sumir os outros** na barra; só o escolhido + **Trocar**.
- Botão **Já estou saindo** → inicia corrida na hora (sem destino = rastreio “Já saindo”).
- Barra: Stuttgart, McLaren, HUB, **Sede** (amarelo), **Outros** (rastreio livre).

---

## 3. Precisão grátis (melhorias possíveis)

- Só somar km com precisão ≤ 25 m.
- Snap ORS mais frequente (cota).
- Exigir GPS bom antes de iniciar corrida.

---

## 4. Internet vs GPS (ver discussão no chat)

**Conclusão:** manter GPS para posição; internet para mapa, Firebase e snap nas ruas. 3G/4G não substitui GPS.
