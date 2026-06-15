# Agent Visualizer — Hackathon Plan

"Datadog for AI agents" — turn buried session logs into an interactive look-back and comparison tool.

---

## Architecture

### Event Source
Mako AI session event system. Every event carries: `sessionId`, `requestId`, `parentEventId`, `eventId`, `timestamp`.

Key types: `AIServiceRequest/Response`, `ActionStarted/Completed`, `ToolStarted/Completed`, `AssistantRequest/Response`, `McpRequest/Response`, `AgentThinkingCompleted`.

Full schema: `~/dev/postman/mako.yaml` | Types: `src/models/interfaces/sessionEvent.ts`

### Causality Model
`parentEventId` forms the primary tree. Enriched edges:
- `CHILD_OF` — parentEventId
- `TRIGGERED` — ToolStarted → ActionStarted via `toolCallId`
- `PRODUCED_BY` — AssistantResponse → ActionCompleted outputs

### Graph Storage
**Domo Graph DB** — internal graph database within the Domo platform. Mako writes events as nodes/edges at session time. Huckleberry proxies queries to the graph, consistent with its existing pattern of proxying to Domo services.

One node per event, labeled by type. Edges: `CHILD_OF`, `TRIGGERED`, `PRODUCED_BY`.

### Write Path (Mako)
Mako writes events directly to the Domo graph DB during session execution. No separate ingest step — events are graph-native at creation time. Enriched edges (`TRIGGERED`, `PRODUCED_BY`) computed at write time.

### Read Path (Huckleberry)
Huckleberry server exposes a thin query API — canned Cypher for common views + flexible query support for the frontend.

### Timeline Collapse
Show only `Completed` events (carries `durationMs` + output). Drop `Started` noise.

---

## Endpoints

### Already Working (proxied to Mako)
| Route | Client |
|-------|--------|
| `POST /api/sessions` | `AgentSessionService.getSessions()` |
| `GET /api/sessions/:id` | `AgentSessionService.getSession()` |
| `GET /api/sessions/:id/events` | `AgentSessionService.getSessionEvents()` |

### Need to Build (in `server.js`)
| Route | Purpose | Day |
|-------|---------|-----|
| `GET /api/graph/:sessionId` | Cypher query to Domo graph DB, return node/edge structure for DAG view | 1 |
| `POST /api/graph/query` | Flexible Cypher passthrough (constrained subset) for ad-hoc exploration | 2 |
| `POST /api/compare` | Canned aggregation across session IDs from graph DB | 3 |

---

## Views

1. **Session Browse** — list sessions, sort by recency
2. **Session Timeline** — chronological collapsed operations, click to expand payload
3. **DAG Explorer** — React Flow causality graph, click Answer → trace backwards
4. **Session Comparison** — multi-session aggregate: tokens by service, duration breakdown, action frequency, error rates
5. **Heatmap** — time/token breakdown by category

### Token Data
Source: `AIServiceResponseEvent.serviceResponse` → `inputTokens`, `outputTokens`, `totalTokens`, `reasoningTokens`, `modelId`. Display raw counts only (no dollar estimates).

---

## DAG Node Taxonomy

| Category | Color | Maps To |
|----------|-------|---------|
| User Prompt | Blue | `AssistantRequestEvent` |
| Plan/Think | Purple | `AgentThinkingCompleted`, `PLANNING` service |
| Get Context | Green | `dataset_query_action`, `dataset_lookup_action`, `dataset_schema_by_id_action`, `dataset_text_to_sql_action`, `vector_db_query_action`, `kb_query_action`, `fileset_query_action`, `search_action`, `google_query_action`, `firecrawl_action` |
| Use Context | Orange | `chart_builder_action`, `page_builder_action`, `html_generation_action`, `javascript_generation_action`, `code_engine_*`, `card_action`, `create_data_app_action`, `design_app_spec_action` |
| Model Call | Teal | `AIServiceResponseEvent` (TEXT_GENERATION, TOOL_CALLING, TEXT_TO_SQL) |
| Answer | Gold | `AssistantResponseEvent` |
| Other | Grey | Catch-all |

---

## Team & Schedule

**Team:** 2 devs (A = backend/data, B = frontend/viz) + 1 designer

### Dev A — Data & Backend
| Day | Deliverable |
|-----|-------------|
| 1 | Define graph schema (node labels, edge types, properties), coordinate Mako write integration, `GET /api/graph/:sessionId` with canned Cypher |
| 2 | Edge enrichment logic in Mako (TRIGGERED, PRODUCED_BY), `POST /api/graph/query` with constrained Cypher |
| 3 | `POST /api/compare` endpoint, heatmap aggregation query |
| 4-5 | Pagination, perf tuning, demo data curation |

### Dev B — Frontend
| Day | Deliverable |
|-----|-------------|
| 1 | Session browse page (from existing `/api/sessions`), session detail page scaffold |
| 2 | Session observability view: event timeline table + token usage graph (from existing `/api/sessions/:id/events`), linked brushing |
| 3 | Node taxonomy mapper (event→category/color), prepare DAG Explorer shell (React Flow + dagre), wire to graph API once contracts land |
| 4-5 | Comparison view (once `/api/compare` is ready), integration, polish, demo walkthrough |

### Designer
| Day | Deliverable |
|-----|-------------|
| 1 | Node taxonomy visuals (shapes, colors, icons), timeline row layout |
| 2 | DAG Explorer: node/edge styling, detail panel, empty states |
| 3 | Comparison dashboard layout, heatmap visual |
| 4-5 | Polish, animations, presentation deck |

### Dependency Handoffs
```
Day 1 EOD → Dev A has graph schema defined + Mako writing events; Dev B swaps mocks for live queries
Day 2 EOD → Designer delivers node specs; Dev B applies to DAG Explorer
Day 3 AM  → Dev A's compare endpoint ready; Dev B wires dashboard
```

---

## Existing Infrastructure

- `@xyflow/react` + `@dagrejs/dagre` — installed, proven in `Ontology/ModelCanvas`
- `src/utils/processStep.ts`, `conversationTurn.ts`, `sessionMessages.ts` — event processing utilities
- `src/services/agentSession.ts` — session/event API client
- `server.js` — bare ViteExpress, proxies to Domo services
