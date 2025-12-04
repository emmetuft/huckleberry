# Backend API

Node.js backend with Express and Neo4j integration.

## Structure

```
server/
├── routes/         # API route definitions
├── controllers/    # Request handlers and business logic
├── services/       # External service integrations (Neo4j, etc.)
├── middleware/     # Express middleware
├── models/         # Data models and types
├── utils/          # Utility functions
└── index.ts        # Server setup and initialization
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
NODE_ENV=development
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server and Neo4j connection status

### Ontology API
- `GET /api/ontology/nodes` - Get all nodes (limit 100)
- `GET /api/ontology/relationships` - Get all relationships (limit 100)
- `GET /api/ontology/graph` - Get complete graph structure (limit 500)
- `POST /api/ontology/query` - Execute custom Cypher query
  ```json
  {
    "cypher": "MATCH (n:Person) RETURN n LIMIT 10",
    "params": {}
  }
  ```
- `POST /api/ontology/nodes` - Create a new node
  ```json
  {
    "label": "Person",
    "properties": {
      "name": "John Doe",
      "age": 30
    }
  }
  ```

## Development

The server is integrated with Vite for hot module reloading during development.

Start the dev server:
```bash
yarn start
```

## Neo4j Connection

The Neo4j service automatically connects on server startup. Connection status is logged to the console.

To test the connection, visit: `http://localhost:3000/api/health`
