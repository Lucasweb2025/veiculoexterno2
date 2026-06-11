# Especificação — L.A. Controle de Frota

Versão: **1.0** (após testes de rua 28/05/2026)  
App motorista: `index.html` · Painel: `painel.html` · Banco: Firebase `la-controle`

---

## Visão geral

Sistema para motoristas da L.A. registrarem deslocamentos (origem → destinos fixos ou livre) e para gestão consultar histórico e trajeto no mapa.

**Base operacional:** Av. dos Imarés, 398 — Moema (matriz).

**Destinos fixos:** Stuttgart, McLaren, HUB, Sede (retorno Moema), Outros (livre).

---

## Papéis

| Papel | Interface | Autenticação |
|-------|-----------|--------------|
| Motorista | App mapa / corrida | Firebase e-mail + senha |
| Gestão | Painel telemetria | Mesmo tipo (conta pode ser igual ou separada no futuro) |

---

## AUTH — Autenticação

### AUTH-01 — Login motorista e painel

- **Quero** informar e-mail e senha cadastrados no Firebase
- **Para** acessar dados da frota com segurança

**Critérios de aceite:**

- [ ] Campos **E-mail** e **Senha** visíveis
- [ ] Senha incorreta → mensagem clara (sem expor senha no código)
- [ ] Sessão persiste ao recarregar (token Firebase)
- [ ] Logout encerra sessão

### AUTH-02 — Banco protegido

- **Quero** que só usuários logados leiam/gravem no Realtime Database

**Critérios de aceite:**

- [ ] Regras RTDB: `auth != null`
- [ ] Sem login, `trips` e `vehicles` inacessíveis

---

## MOT — Motorista (corrida)

### MOT-01 — Fluxo antes da corrida

- **Quero** escolher motorista → veículo → destino → motivo → iniciar

**Critérios de aceite:**

- [ ] Sem destino ou motivo, não inicia (alerta)
- [ ] Veículos: UNO VIVACE, MONTANA
- [ ] Destinos na barra lateral conforme cadastro

### MOT-02 — Corrida ativa (tela ligada) ✅ testado

- **Quero** ver mapa, km, tempo e trajeto enquanto dirijo

**Critérios de aceite:**

- [ ] Botão **Finalizar corrida** sempre visível (parte inferior)
- [ ] GPS com precisão aceitável (filtro &lt; 60 m)
- [ ] Linha do trajeto no mapa
- [ ] Status veículo `EM MOVIMENTO` no Firebase
- [ ] Ao finalizar: grava em `trips`, odômetro atualizado, status `DISPONÍVEL`

### MOT-03 — Finalizar corrida

- **Quero** encerrar e salvar km e rota

**Critérios de aceite:**

- [ ] Mínimo 2 pontos GPS ou alerta para andar mais
- [ ] Confirmação antes de finalizar
- [ ] Falha de rede: corrida permanece ativa para tentar de novo
- [ ] Backup local (`localStorage`) durante corrida

### MOT-04 — Navegação externa

- **Quero** abrir Google Maps (link) para ir até o destino

**Critérios de aceite:**

- [ ] Botão visível antes de iniciar (não durante corrida ativa)
- [ ] Abre app de mapas do celular (sem API Google paga embutida)

### MOT-04 — Recuperar GPS após perda de sinal (túnel / garagem) ✅ implementado

- **Quero** que o app volte a rastrear quando o GPS retorna, com **tela ligada**

**Critérios de aceite:**

- [ ] Após ~45 s sem ponto novo, banner **Sem sinal GPS** (túnel, garagem, prédio)
- [ ] App reinicia `watchPosition` + pede posição atual (cooldown ~30 s entre tentativas)
- [ ] Texto **Retomando GPS após perda de sinal...** no status
- [ ] Ao receber ponto válido de novo, banner volta ao normal e trajeto continua

**Teste de rua (Chrome, tela ligada):** Moema → metrô → Vila das Belezas — sinal parou na entrada do metrô e não voltou ao descer (motivou este requisito).

**Limite:** dentro do túnel **não há** GPS por satélite; só recupera **ao sair**, no ar livre.

### MOT-BG-01 — GPS com tela bloqueada (Fase 6B — ✅ aprovado em campo)

- **Quero** continuar rastreando com **tela apagada**, sem “buraco” no trajeto
- **Para** o painel mostrar a rota **contínua** (sem linha reta falsa entre dois pontos distantes)

#### Problema confirmado nos testes

| Teste | Canal | Resultado |
|-------|-------|-----------|
| 28/05/2026 volta | Chrome/PWA | ~0,07 km; GPS pausou com tela bloqueada |
| 09/06/2026 | **APK** (Fase 6A) | **Km ok** ✅; ao desbloquear, painel desenha **linha reta** do último ponto até a posição atual ⚠️ |
| 09/06/2026 | **APK** (Fase 6B) | Tela bloqueada ✅; **km ok** ✅; painel **Ver rota** segue ruas (Uno Vivace / Fabio) ✅ |

**Causa (6A):** com tela bloqueada o `navigator.geolocation` **pausa** — não grava pontos no meio. Ao voltar, o app liga o ponto antigo ao novo em linha reta.

**O que a 6B deve resolver:** tela apagada **com GPS no ar** (rua, carro) → pontos seguem sendo gravados → **linha continua** no mapa e no painel.

**O que a 6B não resolve:** metrô/túnel sem satélite (ver `MOT-04`).

#### Critérios de aceite (só APK nativo — Fase 6B)

**Comportamento**

- [x] Com corrida ativa e tela **apagada**, GPS continua gravando (intervalo similar à corrida com tela ligada)
- [x] Notificação persistente **“Corrida em andamento”** (obrigatória no Android)
- [x] Ao desbloquear, trajeto no app **sem salto em linha reta** por causa só do bloqueio (trecho percorrido com tela apagada aparece no `path`)
- [x] **Km** no fim da corrida coerente com o deslocamento real (mesmo critério do teste 09/06: km ok)

**Permissões Android**

- [x] Localização **“o tempo todo”** / em segundo plano (além de “durante o uso”)
- [x] Usuário vê explicação clara ao conceder permissão

**Painel (PAINEL-02)**

- [x] **Ver rota** mostra polyline **segue ruas** no trecho gravado com tela apagada (não apenas reta entre 2 pontos)
- [x] Teste de aceite: andar ~200 m com tela apagada → desbloquear → finalizar → painel sem “corte” reto atravessando quarteirão

**Implementação técnica (referência)**

- Plugin background geolocation (ex. `@capacitor-community/background-geolocation` ou equivalente)
- Código com `if (Capacitor.isNativePlatform())` — **site web inalterado**
- `ACCESS_BACKGROUND_LOCATION` no manifest (Android 10+)

#### Status atual

| Canal | Tela bloqueada |
|-------|----------------|
| Web / PWA | ❌ não atende |
| APK Fase 6A | ❌ não atende (km pode parecer ok em trecho curto; linha no painel falha) |
| APK Fase 6B | ✅ aprovado em campo (09/06/2026) |

**Regra operacional (APK):** pode **bloquear a tela** durante a corrida em rua aberta. Metrô/túnel continua sem GPS (`MOT-04`).

**Relacionado:** `CAPACITOR-PLANO.md` (Fase B), `FASE-6-ESTUDO.md` §7.

#### Teste de rua para fechar 6B (repetir Fase 4)

1. APK com 6B instalado  
2. Iniciar corrida → andar 100–200 m tela ligada  
3. **Bloquear tela** → andar mais 100–200 m (rua aberta)  
4. Desbloquear → finalizar  
5. Painel **Ver rota**: linha contínua, **sem** reta atravessando blocos  
6. Km total plausível  

#### Fora do escopo da 6B

- GPS dentro de metrô/túnel (físico)
- Não ligar pontos após gap &gt; X minutos sem sinal (pode virar `MOT-06` opcional)

---

## PAINEL — Gestão

### PAINEL-01 — Histórico

- **Quero** listar viagens com carro, motorista, motivo, data e km

**Critérios de aceite:**

- [x] Lista em tempo real (`trips` Firebase)
- [x] Ordem recente primeiro

### PAINEL-02 — Ver rota

- **Quero** ver o trajeto GPS no mapa

**Critérios de aceite:**

- [x] Modal com polyline laranja
- [x] Título com nome do veículo

### PAINEL-03 — Filtros no histórico (futuro)

**Como** gestor da frota  
**Quero** filtrar a lista de viagens  
**Para** achar corridas de um motorista, destino ou dia sem rolar tudo

#### Campos da tela (proposta)

| Filtro | Tipo | Exemplo |
|--------|------|---------|
| Motorista | lista (select) | Lucas, João, Todos |
| Destino | lista | Stuttgart, McLaren, HUB, Sede, Outros, Todos |
| Data início | date | 28/05/2026 |
| Data fim | date | 28/05/2026 |
| Botão | — | **Filtrar** / **Limpar** |

#### Critérios de aceite (exercício Fase 5 — você valida na implementação)

**Filtro motorista**

- [x] Com “Todos”, mostra todas as viagens (igual hoje)
- [x] Com um motorista escolhido, só cards com `trip.driver` igual (ignorar maiúsc/minúsc)
- [x] Se não houver viagem, mensagem: “Nenhuma viagem neste filtro”

**Filtro destino**

- [x] Com “Todos”, não esconde por destino
- [x] Com destino escolhido, só viagens com `trip.destino` ou `destinoId` correspondente

**Filtro data**

- [x] Só **data início** preenchida → viagens daquele dia (campo `trip.date` no formato pt-BR)
- [x] Início e fim preenchidos → viagens entre as duas datas (inclusive)
- [x] Data inválida (fim antes do início) → alerta e não quebra a lista

**Comportamento geral**

- [x] Filtrar **sem** recarregar a página (F5)
- [x] **Limpar** volta ao estado “Todos” + lista completa
- [x] **Ver Rota** continua funcionando nos cards visíveis
- [x] Filtros combinados (motorista + destino + data) funcionam juntos (AND)

**Performance (nice to have)**

- [ ] Com 100+ viagens, filtro responde em menos de 1 s no celular

#### Fora do escopo (não fazer nesta versão)

- Exportar Excel
- Editar ou apagar viagem pelo painel
**Status:** ✅ implementado em `painel.html` (PAINEL-03).

### PAINEL-04 — Filtro por veículo ✅

- **Quero** filtrar viagens por carro (UNO VIVACE, MONTANA, etc.)

**Critérios de aceite:**

- [x] Select **Veículo** com opção Todos
- [x] Lista só viagens com `trip.car` igual ao filtro
- [x] Combina com motorista, destino e data (AND)
- [x] Limpar volta ao estado inicial

### MOT-05 — Lembrar último destino ✅

- **Quero** ao abrir o mapa, o último destino escolhido já vir selecionado com linha no mapa

**Critérios:**

- [x] Salva `destinoId` no aparelho (`localStorage`)
- [x] Restaura ao entrar no mapa (se existir)
- [x] Atualiza ao trocar destino na barra lateral

#### Como testar quando implementar (Fase 4 de novo)

1. Ter 3 viagens: 2 do Lucas, 1 para McLaren  
2. Filtrar motorista = Lucas → ver 2 cards  
3. Filtrar destino = McLaren → ver 1 card  
4. Limpar → ver 3 cards  

---

### SEC-02 — Perfis motorista / gestor ✅

- **Quero** motorista só no app; gestor só no painel; ninguém apaga viagem antiga

**Critérios:**

- [x] Authentication: e-mail/senha no Console
- [x] Papel em `/users/{uid}/role`: `motorista`, `gestor`, `admin`
- [x] Regras RTDB (`database.rules.json`)
- [x] App valida `motorista` ou `admin`
- [x] Painel valida `gestor` ou `admin`
- [x] Salvamento atômico ao finalizar corrida

**Configuração:** `FIREBASE-PERFIS.md`

---

## SEC — Segurança (continuação)

### SEC-01 — Sem segredos no Git

- **Quero** que senha e chave ORS não fiquem no repositório público

**Critérios de aceite:**

- [x] Login só Firebase Auth
- [x] `la-config.js` no `.gitignore`
- [x] Deploy Pages pode usar secret `ORS_KEY` (Actions)

---

## Dados — contrato `trip` (Firebase `trips`)

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `car` | string | sim |
| `driver` | string | sim |
| `km` | number | sim |
| `time` | string | sim |
| `date` | string | sim |
| `path` | array `[lat,lng]` | sim |
| `destino` | string | sim |
| `destinoId` | string \| null | não |
| `motivoCorrida` | string | sim |

---

## Limites conhecidos (não são bug)

| Item | Comportamento |
|------|----------------|
| PWA + tela bloqueada | GPS pausa |
| APK 6A + tela bloqueada | GPS pausa; painel pode mostrar **linha reta** ao desbloquear (km pode parecer ok) |
| APK 6B + tela bloqueada | GPS em segundo plano; rota contínua no painel ✅ |
| Metrô / túnel | Sem satélite; `MOT-04` retoma ao sair (tela ligada) |
| Linha tremida no mapa | GPS bruto; ORS suaviza se chave configurada |
| Qualquer usuário Auth | Acesso total ao RTDB (regras simples Fase 3) |

---

## Histórico de versão da spec

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 28/05/2026 | Spec inicial pós Fase 4 (testes ida/volta) |
| 1.1 | 09/06/2026 | MOT-BG-01 detalhado (teste APK tela bloqueada); MOT-04/05; PAINEL-04 |
| 1.2 | 09/06/2026 | MOT-BG-01 **aprovado em campo** (Fase 6B): tela bloqueada, km ok, rota no painel |
