# MigraÃ§Ã£o do Chatbot (Finnextho -> WhiLab) â€” DeepSeek + SSE + Supabase

## 1) Objetivo

Portar a integraÃ§Ã£o do chatbot do projeto **Finnextho** para o **WhiLab**, mantendo:

- DeepSeek via SDK `openai` (OpenAI-compatible) com `baseURL = https://api.deepseek.com/v1`
- Endpoint de **streaming** via **SSE** (`text/event-stream`)
- PersistÃªncia/histÃ³rico via **Supabase** (tabela `chat_messages` + models/services do WhiLab)

E preparar o caminho para o chatbot ser **100% autÃ´nomo** (executar aÃ§Ãµes no Supabase antes/durante a resposta).

---

## 2) Arquitetura e arquivos (referÃªncia)

### Finnextho (origem)

- **Controller SSE**:
  - `finnextho/backend/src/controllers/OptimizedChatbotController.ts`
  - SSE events: `connected`, `progress`, `chunk`, `metadata`, `complete`, `error` + `websearch:*`
- **ServiÃ§o de IA (DeepSeek)**:
  - `finnextho/backend/src/services/OptimizedAIService.ts`
  - Streaming real via `stream: true` e `for await (...)`

### WhiLab (destino)

- **Rotas**:
  - `whilab/backend/src/routes/optimizedChatbotRoutes.ts`
  - Mount: `whilab/backend/src/routes/index.ts` em `/api/chatbot`
- **Controller**:
  - `whilab/backend/src/controllers/OptimizedChatbotController.ts`
- **IA (DeepSeek)**:
  - `whilab/backend/src/services/OptimizedAIService.ts`
- **HistÃ³rico/SessÃµes**:
  - `whilab/backend/src/services/chatHistoryService.ts`
  - `whilab/backend/src/models/ChatMessage.ts`

---

## 3) VariÃ¡veis de ambiente

### DeepSeek

- `DEEPSEEK_API_KEY` (obrigatÃ³ria para chamar a API)

### Supabase (WhiLab)

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (quando aplicÃ¡vel)
- `SUPABASE_SERVICE_ROLE_KEY` (admin/servidor)

### CORS / Frontend

- `FRONTEND_URL`
- `FRONTEND_ALT_URL`

---

## 4) Endpoints do Chatbot (WhiLab)

Base: `/api/chatbot`

- `GET /health`
- `POST /query`
  - body: `{ "message": string, "chatId"?: string }`
  - retorna JSON (nÃ£o streaming)
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
  - caso contrÃ¡rio, `Access-Control-Allow-Origin: *`

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

### Streaming (padrÃ£o Finnextho)

- `openai.chat.completions.create({ stream: true })`
- Consumo via `for await (const chunk of stream)`
  - cada delta vem em `chunk.choices[0]?.delta?.content`

---

## 7) Supabase (diferenÃ§as importantes)

No WhiLab, aÃ§Ãµes (criar transaÃ§Ã£o/meta/investimento etc.) devem ser executadas nos Models/Services que usam Supabase, por exemplo:

- `src/models/User.ts` (`findByFirebaseUid`)
- `src/models/Transacao.ts`, `src/models/Meta.ts`, `src/models/Investimento.ts`
- `src/services/chatHistoryService.ts` (persiste conversa em `chat_messages`)

Isso muda o fluxo em relaÃ§Ã£o ao Finnextho, onde parte do contexto/dados vinha de models/serviÃ§os diferentes.

---

## 8) Status da migraÃ§Ã£o

- Streaming SSE no Finnextho: implementado e validado.
- WhiLab:
  - Antes: streaming â€œsimuladoâ€ (quebrando texto final em pedaÃ§os).
  - Agora (apÃ³s esta migraÃ§Ã£o): streaming real via DeepSeek (`stream: true`) + SSE.

---

## 9) PrÃ³ximo passo: tornar 100% autÃ´nomo

Checklist sugerido:

- Detectar intent localmente (regex/heurÃ­stica) antes do streaming.
- Se intent for aÃ§Ã£o e tiver campos suficientes:
  - executar no Supabase (AutomationEngine)
  - responder com mensagem da automaÃ§Ã£o (sem chamar IA quando nÃ£o precisar)
- Se faltar campos:
  - responder pedindo os campos e manter estado no `contextManager`.
- Enviar `metadata` sempre que houver intent/confianÃ§a.

---

## 10) Teste manual

- Rodar o backend e chamar:
  - `POST /api/chatbot/stream` com `{ "message": "..." }`
  - verificar se os eventos chegam em tempo real (nÃ£o â€œbufferizadoâ€ no final)

abri no vs code e estou salvando 
