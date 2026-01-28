export const CONTEXT_STRATEGY_PROMPT = (
  strategies: string,
  userInput: string,
) => `You are analyzing a user's request to determine which context-building strategies should be used to answer it.

Available strategies:
${strategies}

User request: "${userInput}"

Analyze the question and respond with a JSON array of strategy names that should be used. Only include strategies that will contribute meaningful context to answering the question.

Examples:
- "What's my revenue?" → ["metric"] (metric alone can answer this)
- "Who is responsible for the revenue metric?" → ["metric", "graph-rag"] (need both metric info and graph relationships)
- "What departments are in the company?" → ["graph-rag"] (pure graph query)
- "Show me all people in sales" → ["graph-rag"] (pure graph query)

Response (JSON array only):`;

export const CYPHER_GENERATION_PROMPT = `Task: Generate Cypher statement to query a graph database.

Instructions:
- Use only the provided relationship types and properties in the schema.
- Do not use any other relationship types or properties that are not provided.
- Pay attention to the actual property values that exist in the database.

Variable naming (MANDATORY):
- Use 'n' for the primary/starting node.
- Use 'r' for relationships.
- Use 'm' for the related/ending node.

Return requirements:
- The FINAL RETURN clause MUST include: RETURN n, r, m (so that parsing can work correctly).
- You MAY use intermediate WITH clauses before the final RETURN for aggregation, ordering, or limiting results.
- Any aggregation (count, sum, avg, collect) MUST occur in a WITH or RETURN clause, not directly in ORDER BY.
- ORDER BY may only reference variables or aliases defined in the immediately preceding WITH or RETURN.

Example valid pattern:
MATCH (n:Person)-[r]-()
WITH n, count(r) AS relCount
ORDER BY relCount DESC
LIMIT 10
MATCH (n)-[r]-(m)
RETURN n, r, m

Schema:
{schema}

Actual Property Values in Database:
{propertyValues}

Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.`;

export const SCHEMA_IDENTIFICATION_PROMPT = `Task: Identify which nodes, relationships, and properties from the graph schema are relevant to answer the user's question.

Instructions:
- Analyze the user's question and the provided graph schema
- Identify which node labels, relationship types, and their properties would be needed to answer the question
- Return ONLY a valid JSON object with no additional text or explanation
- The JSON should have this exact structure:
{
  "nodes": {
    "NodeLabel1": ["property1", "property2"],
    "NodeLabel2": ["property3"]
  },
  "relationships": {
    "RELATIONSHIP_TYPE": ["property1"]
  }
}
- Only include properties that are relevant to the question
- If no properties are needed for a node/relationship, use an empty array
- If no relationships are relevant, use an empty object for "relationships"

Schema:
{schema}`;

export const GRAPH_RAG_PROMPT = `You are a helpful assistant that answers questions using the provided graph database context. 

The graph contains nodes and relationships, each with properties.
In a previous step, a subset of relevant nodes and relationships was retrieved from the full graph.
**You are not being given all of the data**, only a subset.
Use this subset as context to answer the user's question.

You must follow these rules:

1. Be concise.
- Do not be verbose
- Do not hallucinate information
- Stick to the facts provided in the context

2. Do not include technical details.
- Do not mention the graph
- Do not mention the database
- Do not mention nodes or relationships
- Do not use phrases like "based on the provided content" or "according to the graph data" or "in the data"

3. Use **Markdown**
- Format your answer using Markdown syntax
- Use lists, headings, and code blocks where appropriate
`;
