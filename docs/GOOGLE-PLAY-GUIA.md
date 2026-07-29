# Google Play — L.A. Controle (guia prático)

Conta desenvolvedor: **criada** ✅  
App ID Android: `br.com.lacustom.controle`  
Nome na loja: **L.A. Controle**

Quando você mandar a documentação oficial da Play, encaixamos aqui. Este arquivo é o checklist do projeto.

---

## 1. O que já temos no projeto

| Item | Status |
|------|--------|
| APK debug (teste WhatsApp) | ✅ |
| Permissão GPS no manifest | ✅ |
| Ícone amarelo/preto L.A. | ✅ |
| Política Supabase (login + localização) | Ver seção 5 |

---

## 2. Gerar AAB para a Play (Android Studio — sem CMD)

1. **Build → Generate Signed App Bundle or APK**
2. **Android App Bundle** → Next
3. **Create new...** (keystore) — guarde o arquivo `.jks` e a senha em local seguro (TI/cofre)
4. Preencha alias, senhas, validade (25 anos é comum)
5. Build variant: **release**
6. Finish → pasta `android/app/release/`

**Importante:** sem o keystore você **não atualiza** o app na loja depois.

---

## 3. Play Console — primeiro envio

1. [Play Console](https://play.google.com/console) → **Criar app**
2. Nome: **L.A. Controle**
3. **Teste interno** (recomendado) → nova versão → enviar **AAB**
4. **Testadores** → adicionar e-mails dos motoristas/gestão
5. Preencher fichas obrigatórias (veja abaixo)

---

## 4. Materiais da loja

| Material | Tamanho | Dica |
|----------|---------|------|
| Ícone | 512×512 PNG | Exportar do ícone amarelo L.A. |
| Screenshots | celular | Login + mapa + corrida ativa |
| Descrição curta | até 80 caracteres | Controle de frota L.A. Custom |
| Descrição longa | texto | Motorista registra viagens; gestão vê histórico |

---

## 5. Política de privacidade (rascunho)

O app coleta:

- **Localização** — durante corridas ativas (motorista)
- **E-mail** — login Supabase
- **Dados de viagem** — km, rota, destino, motorista, veículo (Supabase)

Armazenamento: Supabase (`ccysxafhvgqrjlofvavp`).  
Não vendemos dados a terceiros.

*(Substitua por URL da política da L.A. Custom quando o jurídico/site tiver a página.)*

---

## 6. Declarações comuns na Play

- **Tipo de app:** negócios / produtividade
- **Dados coletados:** localização aproximada/precisa, identificadores, dados de uso
- **Permissão localização:** funcionalidade principal (rastreio de frota)
- **Público:** não é app infantil

---

## 7. Depois do teste interno

1. Corrigir bugs da frota (Fase 4 de novo)
2. **Teste fechado** ou **produção**
3. Fase 6B: GPS tela desligada → nova versão na loja

---

## 8. Onde colar a documentação que você vai mandar

Adicione abaixo links ou prints da Play (política de dados, questionário de conteúdo, etc.):

```
(cole aqui)
```
