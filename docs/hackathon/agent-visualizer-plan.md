# Agent Visualizer — Plan

"Datadog for AI agents" / "Chrome DevTools for AI agents"

---

## Core Pitch

Every AI agent is producing prompts, tool calls, retrievals, model invocations, token usage, and errors — but they're buried in logs. This project turns those logs into an interactive **look-back and comparison tool**: explore any past session, compare efficiency across runs, and understand where tokens and time are going.

---

## Decisions Locked

### 1. Event Source
Events come from the Mako AI session event system (`AISessionEventPage`). Full schema in `~/dev/postman/mako.yaml`.

Key event types:
- `AIServiceRequestEvent` — LLM call starts (service: TOOL_CALLING, PLANNING, TEXT_GENERATION, etc.)
- `AIServiceResponseEvent` — LLM call ends
- `AgentThinkingStartedEvent` / `AgentThinkingCompletedEvent` — agent reasoning (has `durationMs`)
- `ActionStartedEvent` / `ActionCompletedEvent` — tool action lifecycle (has `durationMs`, `toolCallId`, `actionType`)
- `ToolStartedEvent` / `ToolCompletedEvent` — tool execution lifecycle
- `AssistantResponseStartEvent` / `AssistantResponseEndEvent` / `AssistantResponseEvent` — final answer
- `McpRequestEvent` / `McpResponseEvent` — MCP tool calls
- `RequestConfirmationEvent` — user confirmation required
- `CancelEvent`, `AIWarningEvent`, `AIDurationEvent` — operational events

Every event shares: `sessionId`, `requestId`, `parentEventId`, `eventId`, `timestamp`

### 2. Causality Model
`parentEventId` (on every event) forms the primary causality tree. Additional edge types enrich the DAG:
- `CHILD_OF` — parentEventId
- `TRIGGERED` — ToolStarted → ActionStarted via `toolCallId`
- `PRODUCED_BY` — AssistantResponse → ActionCompleted outputs that fed it

### 3. Graph Storage
**Neo4j** — local instance for dev, Aura (cloud) for demo/production.

Written directly from the Node/Express server as events arrive.
No intermediate SQLite layer.

Node model: one node per event, labeled by event type.
Edge model: `CHILD_OF`, `TRIGGERED`, `PRODUCED_BY`.

### 4. Ingest Strategy
Pull-based: fetch `AISessionEventPage` for a session on demand, write to Neo4j, render. No streaming/webhooks needed. Tool is purely retrospective — not a live monitor.

### 5. Timeline Collapse Strategy
Show only `Completed` events (carries `durationMs` and output). Drop `Started` noise for historical view.

---

## Tech Stack

### Backend
- Node.js + Express
- Neo4j driver (direct write on event ingest)
- Neo4j local (dev) / Aura (demo)

### Frontend
- React
- React Flow — DAG / timeline visualization
- Node types: Prompt, Plan, Tool, Memory, Model, Answer
- Edge types: caused_by, generated, retrieved, used

### API
- `POST /event` — ingest single event, write to Neo4j
- `GET /session/:id` — flat event list for timeline view
- `GET /session/:id/graph` — graph structure for DAG view

### Mako Source Endpoints
- `GET /api/ai/v1/sessions/{sessionId}/events` — full session event list, paginated via `next` cursor → **primary ingest source**
- `GET /api/ai/v1/sessions/{sessionId}/requests/{requestId}/events` — events scoped to one request
- `GET /api/ai/v1/sessions` — session list for browse/comparison view
- `GET /api/ai/v1/admin/sessions/{sessionId}/events` — admin variant (same shape)

---

## Views

### 1. Session Timeline
Chronological list of collapsed logical operations.
Click any row → see full event payload.

### 2. DAG Explorer (React Flow)
Nodes connected by causality edges.
Click Final Answer → trace backwards through the graph.

### 4. Session Comparison View
Aggregate cost/efficiency dashboard across runs — different models, different prompts, general spend assessment:
- Token usage by service type across sessions
- Duration breakdown (tool calls vs model calls vs thinking)
- Cost per session (tokens × model rate)
- Action type frequency and cost contribution
- Error rates
- No fixed grouping required — ad-hoc session selection with aggregate roll-up

### 5. Agent Heatmap
Time breakdown: Tool Calls / Model Calls / Retrieval / Thinking
Token breakdown by service type.

### 6. Token / Cost Data
- Source: `AIServiceResponseEvent.serviceResponse` → `ModelProviderUsage`
  - `inputTokens`, `outputTokens`, `totalTokens`, `reasoningTokens`
  - `modelId` — needed to apply per-model cost rates
- `service` field on the event tells us the AI service type (TOOL_CALLING, PLANNING, etc.)
- Cost display: **raw token counts only** — inputTokens, outputTokens, totalTokens, reasoningTokens. No dollar estimates (pricing tiers too complex). Token counts are the primary efficiency metric.
- **Open**: confirm `serviceResponse` shape matches `TextAIResponse` + `ModelProviderUsage` against a real event payload

## DAG Node Taxonomy

Six visual categories, consistent across DAG and heatmap:

| Node Type | Color | Event/Action Types |
|---|---|---|
| **User Prompt** | Blue | `AssistantRequestEvent` |
| **Plan / Think** | Purple | `AgentThinkingCompletedEvent`, `PLANNING` service |
| **Get Context** | Green | `dataset_query_action`, `dataset_lookup_action`, `dataset_schema_by_id_action`, `dataset_text_to_sql_action`, `vector_db_query_action`, `kb_query_action`, `fileset_query_action`, `search_action`, `google_query_action`, `firecrawl_action` |
| **Use Context** | Orange | `chart_builder_action`, `page_builder_action`, `html_generation_action`, `javascript_generation_action`, `code_engine_*`, `card_action`, `create_data_app_action`, `design_app_spec_action` |
| **Model Call** | Teal | `AIServiceResponseEvent` (TEXT_GENERATION, TOOL_CALLING, TEXT_TO_SQL, etc.) |
| **Answer** | Gold | `AssistantResponseEvent` |
| **Other** | Grey | Everything else (catch-all) |

## Build Schedule

### Day 1
- Neo4j setup + event ingest pipeline
- Session Timeline view

### Day 2
- DAG Explorer (React Flow)

### Day 3
- Session Comparison / token analytics dashboard

### Day 4-5
- Polish, demo script, edge cases
