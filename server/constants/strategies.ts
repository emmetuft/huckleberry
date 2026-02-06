export const GRAPH_RAG_DESCRIPTION = `
Use when the user is asking about specific entities, relationships, or factual knowledge stored in the graph.
Queries the knowledge graph to retrieve concrete entities (e.g., people, teams, systems) and their relationships or attributes. Best suited for questions that involve who/what/where, connections between things, ownership or lineage, or counting and listing entities based on relationships. Trigger when the user references named entities, asks how things are connected, or needs grounded facts rather than computed insights or personalization.

The knowledge graph can answer:
- What entities exist and how they are related
- Counts and lists of entities connected by relationships
- Ownership, membership, lineage, and dependency questions
- User activity and contributions (e.g., repos, dashboards, systems)`;

export const METRIC_DESCRIPTION = `
Use when the user is asking for quantitative, analytical, or performance-related information. Retrieves relevant pre-defined business metrics based on the user’s role or department, then queries the underlying data sources to return current or historical values. Best for questions involving KPIs, totals, trends, comparisons, or “how are we doing” type requests, rather than descriptive knowledge or relationships.`;

export const PERSONA_DESCRIPTION = `
Use when the response should be tailored to the user's role, responsibilities, goals, or expertise. Retrieves profile and behavioral context (e.g., role, department, focus areas, strengths, priorities) to shape tone, depth, framing, and recommendations—rather than to supply factual or metric data.`;

export const MCP_TOOL_DESCRIPTION = `
Use when external tools or integrations would help answer the user's question. Executes MCP server tools that can perform operations like querying external databases, fetching data from APIs, executing workflows, or calling custom integrations. Best suited for questions that require data or actions beyond the knowledge graph, metrics, and persona context - such as fetching live data, executing queries against external systems, or performing operations that require tool integrations.`;

export const DATASOURCE_DESCRIPTION = `
Use when the user needs to query specific datasources or when data from external datasources would help answer the question. Fetches schema, generates appropriate SQL queries, and executes them against datasources to retrieve relevant data. Best suited for questions that require direct database queries, data analysis, or when the user explicitly mentions datasources.`;
