# Backend API

Node.js backend with Express and Neo4j integration.

## Structure

```
server/
├── routes/         # API route definitions
├── controllers/    # Request handlers and business logic
├── services/       # External service integrations (Neo4j, etc.)
├── middleware/     # Express middleware
├── constants/      # Data constants (prompts, descriptions, etc.)
├── utils/          # Utility functions
└── index.ts        # Server setup and initialization
```

## Environment Variables

Copy `.env.example` to `.env` and configure

## Development

The server is integrated with Vite for hot module reloading during development.

Start the dev server:

```bash
yarn start
```

## Neo4j Connection

The Neo4j service automatically connects on server startup. Connection status is logged to the console.

To test the connection, visit: `http://localhost:3000/api/health`

## AI Context Strategies

1. Knowledge Graph RAG (Entity & Relationship Context)

### Purpose

Graph RAG is used to retrieve grounded factual context from the knowledge graph, which contains the entities and relationships important to the business.

### What it does

- Queries the knowledge graph for relevant entities and relationships
- Supports listing, counting, and describing connected entities
- Provides structured, grounded context for downstream reasoning

### When to use

- The user is asking about specific entities (e.g., people, teams, repositories, systems)
- The question involves relationships, ownership, lineage, dependencies, or membership
- The answer can be derived by listing or counting entities or traversing relationships in the graph

2. Graph Metrics (Analytical & KPI Context)

### Purpose

Graph Metrics is used for quantitative and analytical questions that require retrieving values for pre-defined business metrics and querying their underlying data sources.

### What it does

- Uses the knowledge graph to identify relevant metrics based on the user’s team/department
- Resolves metric → data source relationships
- Queries underlying systems to retrieve metric values

### When to use

- The question involves KPIs, totals, trends, comparisons, or performance evaluation
- Metric relevance depends on the user’s role or department
- Answering the question requires querying a connected data source

3. User Persona (Personalization & Framing Context)

### Purpose

User Persona is used to shape how an answer is framed, not to supply factual or metric data. It personalizes responses based on who the user is and what matters to them.

### What it does

- Retrieves user profile context (e.g., role, department, goals, strengths)
- Shapes tone, depth, priorities, and recommendations
- Helps resolve ambiguity and tailor guidance

### When to use

- The question is open-ended, subjective, or advisory
- There is no single “correct” answer
- The best response depends on the user’s role, goals, responsibilities, or expertise

4. Decision Graph RAG
5. HYDE RAG
