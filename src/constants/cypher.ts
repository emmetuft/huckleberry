// 1. Load CSV data into Neo4j with vector properties
// LOAD CSV WITH HEADERS
// FROM 'https://data.neo4j.com/llm-vectors-unstructured/Quora-QuAD-1000-embeddings.csv' AS row

// MERGE (q:Question{text:row.question})
// WITH row,q
// CALL db.create.setNodeVectorProperty(q, 'embedding', apoc.convert.fromJsonList(row.question_embedding))

// MERGE (a:Answer{text:row.answer})
// WITH row,a,q
// CALL db.create.setNodeVectorProperty(a, 'embedding', apoc.convert.fromJsonList(row.answer_embedding))

// MERGE(q)-[:ANSWERED_BY]->(a)

// 2. Create vector indexes on the embedding properties
// cypher - CREATE VECTOR INDEX Syntax
// CREATE VECTOR INDEX [index_name] [IF NOT EXISTS]
// FOR (n:LabelName)
// ON (n.propertyName)
// OPTIONS "{" option: value[, ...] "}"

// CREATE VECTOR INDEX questions IF NOT EXISTS
// FOR (q:Question)
// ON q.embedding
// OPTIONS {indexConfig: {
//  `vector.dimensions`: 1536,
//  `vector.similarity_function`: 'cosine'
// }}
// Note that the index is called questions, is against the Question label, and is on the .embedding property.
// The vector.dimensions is 1536 (as used by OpenAI) and the vector.similarity_function is cosine.
// The IF NOT EXISTS clause ensures that the statement only creates the index if it does not already exist.
// https://neo4j.com/docs/cypher-manual/current/indexes/semantic-indexes/vector-indexes/#indexes-vector-similarity

// 3. Query the vector index to find similar questions
// MATCH (q:Question {text: "What are the most touristic countries in the world?"})
// CALL db.index.vector.queryNodes('questions', 6, q.embedding)
// YIELD node, score
// RETURN node.text, score

// The MATCH clause finds the specific Question node.
// The query uses the db.index.vector.queryNodes function to query the questions vector index with the Question node’s embedding - q.embedding. The function returns the top 6 similar nodes.
// YIELD obtain the node and similarity score returned by the function.
// The query returns the Question node’s text property and the similarity score.

// 4. Create new embeddings
// genai.vector.encode(
//     resource :: STRING,
//     provider :: STRING,
//     configuration :: MAP = {}
// ) :: LIST<FLOAT>

// WITH genai.vector.encode("Test", "OpenAI", { token: "sk-..." }) AS embedding
// RETURN embedding

// WITH genai.vector.encode(
//     "What are good open source projects",
//     "OpenAI",
//     { token: "sk-..." }) AS userEmbedding
// CALL db.index.vector.queryNodes('questions', 6, userEmbedding)
// YIELD node, score
// RETURN node.text, score
