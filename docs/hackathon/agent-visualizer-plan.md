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
**Neo4j** (local Docker for dev, Aura for demo). One node per event, labeled by type. Edges: `CHILD_OF`, `TRIGGERED`, `PRODUCED_BY`.

Required for cross-session pattern queries and aggregation. Client-side graph build is insufficient for comparison view at scale.

### Ingest
Pull-based: fetch session events on demand, batch-write to Neo4j. Retrospective only — no streaming.

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
| `POST /api/ingest/:sessionId` | Fetch events from Mako, batch-write to Neo4j | 1 |
| `GET /api/graph/:sessionId` | Return node/edge structure from Neo4j for DAG view | 2 |
| `POST /api/compare` | Accept session IDs, return aggregate stats from Neo4j | 3 |

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
| 1 | Neo4j Docker, connection in `server.js`, `POST /api/ingest/:sessionId`, batch-load real sessions |
| 2 | Edge enrichment (TRIGGERED, PRODUCED_BY), `GET /api/graph/:sessionId`, Cypher aggregation queries |
| 3 | `POST /api/compare` endpoint, heatmap data query |
| 4-5 | Pagination, perf tuning, demo data curation |

### Dev B — Frontend
| Day | Deliverable |
|-----|-------------|
| 1 | Event→Node mapper (taxonomy + edges from `parentEventId`), Session Timeline component, session browse page |
| 2 | DAG Explorer (React Flow + dagre, clone `ModelCanvas` patterns), click-to-trace, node detail panel |
| 3 | Wire comparison dashboard to `/api/compare`, multi-session selector, token charts |
| 4-5 | Integration, view transitions, edge cases, demo walkthrough |

### Designer
| Day | Deliverable |
|-----|-------------|
| 1 | Node taxonomy visuals (shapes, colors, icons), timeline row layout |
| 2 | DAG Explorer: node/edge styling, detail panel, empty states |
| 3 | Comparison dashboard layout, heatmap visual |
| 4-5 | Polish, animations, presentation deck |

### Dependency Handoffs
```
Day 1 EOD → Dev A has Neo4j with data; Dev B swaps mocks for live
Day 2 EOD → Designer delivers node specs; Dev B applies to DAG Explorer
Day 3 AM  → Dev A's compare endpoint ready; Dev B wires dashboard
```

---

## Existing Infrastructure

- `@xyflow/react` + `@dagrejs/dagre` — installed, proven in `Ontology/ModelCanvas`
- `neo4j-driver@^6` — installed, no active connection
- `src/utils/processStep.ts`, `conversationTurn.ts`, `sessionMessages.ts` — event processing utilities
- `src/services/agentSession.ts` — session/event API client
- `server.js` — bare ViteExpress, no routes yet
