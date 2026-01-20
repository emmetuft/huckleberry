export const CYPHER_GENERATION_PROMPT = `Task: Generate Cypher statement to query a graph database.

Instructions:
- Use only the provided relationship types and properties in the schema
- Do not use any other relationship types or properties that are not provided
- Pay attention to the actual property values that exist in the database
- When filtering by properties, account for data inconsistencies (e.g., "Utah" vs "UT")
- IMPORTANT: You MUST use these exact variable names in your query:
  * 'n' for the primary/starting node
  * 'r' for relationships
  * 'm' for the related/ending node
- IMPORTANT: Your query MUST return 'n', 'r', and 'm' (e.g., "RETURN n, r, m")
- Example query format: MATCH (n:Person)-[r:KNOWS]->(m:Person) WHERE n.location IN ["Utah", "UT"] RETURN n, r, m
- Return ONLY the Cypher statement with no explanations or additional text

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
