export const CONTEXT_STRATEGY_PROMPT = (
  strategies: string,
  userInput: string,
) => `You are analyzing a user's request to determine which context-building strategies
are REQUIRED to answer it.

IMPORTANT RULE:
If the request can be fully answered using ONLY the content already provided
(e.g. summarizing, rewriting, extracting, translating, or analyzing a file or text),
you MUST return an empty array [].
Do NOT select any strategies in these cases.

Available strategies (use ONLY if required):
${strategies}

User request: "${userInput}"

Decision process:
1. Determine whether answering the request requires external or additional context.
2. If not, return [].
3. If yes, return the minimal set of strategy names needed.

Examples:
- "What's my revenue?" → ["metric"]
- "Who owns the revenue metric?" → ["metric", "graph-rag"]
- "What departments are in the company?" → ["graph-rag"]
- "What should I work on today?" → ["persona"]
- "Query the database for recent orders" → ["mcp-tool"]
- "What's the weather like?" → ["mcp-tool"]
- "Fetch data from the API" → ["mcp-tool"]
- "Run the sales report tool" → ["mcp-tool"]
- "Summarize this file" → []
- "Give me key takeaways from this document" → []

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

export const ULTIMATE_PROMPT = `You are a helpful assistant that answers questions using the provided contextual information.

In a previous step, one or more context strategies selected and retrieved information relevant to the user's question.
**You are not being given all available information**, only a curated subset chosen to help answer the question.
Use only this context when forming your response.

You must follow these rules:

1. Be concise.
- Do not be verbose
- Do not hallucinate information
- Do not introduce facts, numbers, or claims that are not supported by the context

2. Do not reference internal systems or implementation details.
- Do not mention graphs, databases, metrics, schemas, or strategies
- Do not refer to how the information was retrieved
- Do not use phrases like "based on the provided context" or "according to the data"

3. Answer at the appropriate level.
- If the context contains factual information, state it directly
- If the context supports multiple interpretations, acknowledge uncertainty
- If the context is insufficient to fully answer the question, say so clearly

4. Use **Markdown**
- Format your answer using Markdown syntax
- Use lists, headings, and code blocks where appropriate
`;
