# Migração do Chatbot (Finnextho -> Bovinext) — DeepSeek + SSE + Supabase

## 1) Objetivo

Portar a integração do chatbot do projeto **Finnextho** para o **Bovinext**, mantendo:

- DeepSeek via SDK `openai` (OpenAI-compatible) com `baseURL = https://api.deepseek.com/v1`
- Endpoint de **streaming** via **SSE** (`text/event-stream`)
- Persistência/histórico via **Supabase** (tabela `chat_messages` + models/services do Bovinext)

E preparar o caminho para o chatbot ser **100% autônomo** (executar ações no Supabase antes/durante a resposta).

---

## 2) Arquitetura e arquivos (referência)

### Finnextho (origem)

- **Controller SSE**:
  - `finnextho/backend/src/controllers/OptimizedChatbotController.ts`
  - SSE events: `connected`, `progress`, `chunk`, `metadata`, `complete`, `error` + `websearch:*`
- **Serviço de IA (DeepSeek)**:
  - `finnextho/backend/src/services/OptimizedAIService.ts`
  - Streaming real via `stream: true` e `for await (...)`

### Bovinext (destino)

- **Rotas**:
  - `bovinext/backend/src/routes/optimizedChatbotRoutes.ts`
  - Mount: `bovinext/backend/src/routes/index.ts` em `/api/chatbot`
- **Controller**:
  - `bovinext/backend/src/controllers/OptimizedChatbotController.ts`
- **IA (DeepSeek)**:
  - `bovinext/backend/src/services/OptimizedAIService.ts`
- **Histórico/Sessões**:
  - `bovinext/backend/src/services/chatHistoryService.ts`
  - `bovinext/backend/src/models/ChatMessage.ts`

---

## 3) Variáveis de ambiente

### DeepSeek

- `DEEPSEEK_API_KEY` (obrigatória para chamar a API)

### Supabase (Bovinext)

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (quando aplicável)
- `SUPABASE_SERVICE_ROLE_KEY` (admin/servidor)

### CORS / Frontend

- `FRONTEND_URL`
- `FRONTEND_ALT_URL`

---

## 4) Endpoints do Chatbot (Bovinext)

Base: `/api/chatbot`

- `GET /health`
- `POST /query`
  - body: `{ "message": string, "chatId"?: string }`
  - retorna JSON (não streaming)
- `GET /stream`
  - query: `?message=...&chatId=...`
  - retorna SSE
- `POST /stream`
  - body: `{ "message": string, "chatId"?: string }`
  - retorna SSE
- `POST /sessions`
- `GET /sessions`
- `DELETE /sessions/:chatId`

---

## 5) Contrato de Streaming SSE

### Headers recomendados

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`
- `X-Accel-Buffering: no`
- CORS:
  - se houver `Origin`, responder `Access-Control-Allow-Origin: <origin>` e `Access-Control-Allow-Credentials: true`
  - caso contrário, `Access-Control-Allow-Origin: *`

### Formato de evento

Cada evento enviado como:

```
 event: <nome>
 data: <json>

```

### Eventos

- `connected`
  - `{ "message": "Stream iniciado" }`

- `chunk`
  - `{ "chunk": "texto", "isComplete": false }`

- `metadata`
  - `{ "intent": string|null, "entities": any, "confidence": number|null, "actionExecuted": boolean, "automationData": any|null, "requiresInput": boolean, "missingFields": string[], "requiresConfirmation": false, "actionData": null }`

- `complete`
  - `{ "success": true }`

- `error`
  - `{ "success": false, "message": "..." }`

---

## 6) DeepSeek (como chamar)

### Base URL e modelo

- `baseURL`: `https://api.deepseek.com/v1`
- `model`: `deepseek-chat`

### Streaming (padrão Finnextho)

- `openai.chat.completions.create({ stream: true })`
- Consumo via `for await (const chunk of stream)`
  - cada delta vem em `chunk.choices[0]?.delta?.content`

---

## 7) Supabase (diferenças importantes)

No Bovinext, ações (criar transação/meta/investimento etc.) devem ser executadas nos Models/Services que usam Supabase, por exemplo:

- `src/models/User.ts` (`findByFirebaseUid`)
- `src/models/Transacao.ts`, `src/models/Meta.ts`, `src/models/Investimento.ts`
- `src/services/chatHistoryService.ts` (persiste conversa em `chat_messages`)

Isso muda o fluxo em relação ao Finnextho, onde parte do contexto/dados vinha de models/serviços diferentes.

---

## 8) Status da migração

- Streaming SSE no Finnextho: implementado e validado.
- Bovinext:
  - Antes: streaming “simulado” (quebrando texto final em pedaços).
  - Agora (após esta migração): streaming real via DeepSeek (`stream: true`) + SSE.

---

## 9) Próximo passo: tornar 100% autônomo

Checklist sugerido:

- Detectar intent localmente (regex/heurística) antes do streaming.
- Se intent for ação e tiver campos suficientes:
  - executar no Supabase (AutomationEngine)
  - responder com mensagem da automação (sem chamar IA quando não precisar)
- Se faltar campos:
  - responder pedindo os campos e manter estado no `contextManager`.
- Enviar `metadata` sempre que houver intent/confiança.

---

## 10) Teste manual

- Rodar o backend e chamar:
  - `POST /api/chatbot/stream` com `{ "message": "..." }`
  - verificar se os eventos chegam em tempo real (não “bufferizado” no final)

abri no vs code e estou salvando 