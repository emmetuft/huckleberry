# MCP External Server Integration Specification

## Overview

This specification documents the MCP (Model Context Protocol) External Server Integration feature for Huckleberry. This feature allows users to connect external MCP servers (HTTP/SSE-based) to Huckleberry, store configurations, and dynamically integrate their tools into chat.

## Architecture

```
┌─────────────┐      ┌───────────────────┐      ┌─────────────────────┐
│   Frontend  │──SSE─│  Express Backend  │─HTTP─│  External MCP       │
│   (React)   │      │  (MCP Client)     │      │  Servers (any)      │
│             │      │                   │      │  - Database tools   │
│  MCP Server │      │  Server Registry  │      │  - File tools       │
│  Management │      │  (persistent)     │      │  - Custom APIs      │
└─────────────┘      └───────────────────┘      └─────────────────────┘
```

## Data Model

### MCP Server Configuration

```typescript
interface MCPServerConfig {
  id: string;                      // Unique identifier (UUID)
  name: string;                    // Display name
  description?: string;            // Optional description
  url: string;                     // HTTP endpoint
  transport: 'http' | 'sse';       // Transport type
  authType: 'none' | 'bearer' | 'api-key';
  authToken?: string;              // Encrypted at rest
  enabled: boolean;                // Toggle to enable/disable
  createdAt: string;               // ISO timestamp
  updatedAt?: string;              // ISO timestamp
  lastConnectedAt?: string;        // Last successful connection
  connectionStatus?: 'connected' | 'disconnected' | 'error' | 'unknown';
  tools: MCPToolDefinition[];      // Cached tool list
}
```

### MCP Tool Definition

```typescript
interface MCPToolDefinition {
  name: string;                    // Tool name
  description: string;             // Tool description
  inputSchema: JSONSchema;         // Input parameters schema
  serverId: string;                // Parent server ID
  serverName?: string;             // Server name for display
}
```

## Storage

### Domo AppDB

The MCP registry uses Domo AppDB for persistent storage, consistent with other Huckleberry services (e.g., personas).

**Collection:** `96bfadf7-9c4e-4cdb-91bb-808b05edd3db`

Each document contains:
- Server configuration (name, URL, transport, auth settings)
- Cached tools array for that server

Documents are managed via the AppDB REST API at:
```
${DOMO_INSTANCE_URL}/api/datastores/v2/collections/{collectionId}/documents
```

## API Endpoints

### Server Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/mcp/servers` | Add new MCP server |
| `GET` | `/api/mcp/servers` | List all servers |
| `GET` | `/api/mcp/servers/:id` | Get server details |
| `PUT` | `/api/mcp/servers/:id` | Update server config |
| `DELETE` | `/api/mcp/servers/:id` | Remove server |
| `POST` | `/api/mcp/servers/:id/test` | Test connection |
| `POST` | `/api/mcp/servers/:id/sync` | Refresh tool list |
| `PATCH` | `/api/mcp/servers/:id/toggle` | Toggle enabled state |

### Tool Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mcp/tools` | List all available tools (from enabled servers) |
| `POST` | `/api/mcp/tools/execute` | Execute a tool |

## MCP Protocol Implementation

### HTTP Transport

The `MCPHttpClient` implements the MCP protocol over HTTP:

1. **Initialize** - Handshake with protocol version and capabilities
2. **List Tools** - Discover available tools from server
3. **Call Tool** - Execute a tool with parameters

### Authentication

Supported authentication methods:
- `none` - No authentication
- `bearer` - Bearer token in Authorization header
- `api-key` - API key in X-API-Key header

## Context Strategy Integration

### MCP Tool Strategy

The `MCPToolStrategy` is a context strategy that:
- Has priority 0 (highest - runs first)
- Auto-selects when tools are provided in the request
- Executes selected tools and formats results for LLM context

```typescript
class MCPToolStrategy implements ContextStrategy {
  name = ContextStrategyType.MCP_TOOL;
  priority = 0;

  async buildContext(userRequest: UserRequest): Promise<ContextResult> {
    // Execute tools and format results
  }
}
```

## Frontend Components

### Integrations Page (`/integrations`)

The Integrations page has two tabs:
1. **MCP Servers** - Manage external MCP server connections
2. **Data Integrations** - Existing integration management

### Server Management UI

- Server cards showing name, URL, status, tool count
- Add/Edit modal with form fields
- Test connection button
- Sync tools button
- Enable/disable toggle
- Delete with confirmation

### Chat Integration

#### @ Command

When typing `@` in the chat input, a popup shows available tools grouped by server.

#### Tool Browser

A modal accessible from the toolbar that allows browsing all available tools with:
- Search functionality
- Tools grouped by server
- Multi-select for adding tools to chat

## Stream Events

New stream event types for tool execution:

```typescript
enum StreamType {
  // ... existing types
  TOOL_START = 'tool_start',
  TOOL_RESULT = 'tool_result',
  TOOL_ERROR = 'tool_error',
}
```

## Redux State

### MCP Slice

```typescript
interface MCPState {
  servers: MCPServerConfig[];
  tools: MCPToolDefinition[];
  selectedServerId: string | null;
  loading: boolean;
  error: string | null;
  testingServerId: string | null;
  testResult: MCPTestConnectionResult | null;
  syncingServerId: string | null;
}
```

## File Structure

### Backend Files

```
server/
├── services/
│   ├── mcpRegistry.service.ts    # CRUD for MCP servers (AppDB)
│   └── mcpHttpClient.ts          # MCP HTTP protocol client
├── controllers/
│   └── mcp.controller.ts         # API endpoint handlers
├── routes/
│   └── mcp.routes.ts             # Route definitions
└── __tests__/
    ├── services/
    │   ├── mcpRegistry.service.test.ts
    │   └── mcpHttpClient.test.ts
    ├── controllers/
    │   └── mcp.controller.test.ts
    └── integration/
        └── mcp-external.test.ts
```

### Frontend Files

```
src/
├── services/
│   └── mcp.ts                    # API client
├── reducers/
│   └── mcp/
│       ├── slice.ts              # Redux slice
│       └── actions.ts            # Async thunks
├── components/
│   ├── Integrations/
│   │   ├── Integrations.tsx      # Main page (updated)
│   │   └── AddServerModal.tsx    # Add/edit modal
│   └── comms/
│       ├── IntentInput/
│       │   ├── IntentInput.tsx   # Updated for MCP tools
│       │   └── ToolPopup.tsx     # Updated grouped by server
│       └── ToolBrowser/
│           ├── ToolBrowser.tsx   # Tool browser modal
│           └── ToolBrowser.module.scss
└── __tests__/
    └── services/
        └── mcp.test.ts
```

### Shared Files

```
shared/models/
├── interfaces/
│   └── mcpServer.ts              # MCP types
└── enums/
    ├── contextStrategy.ts        # Added MCP_TOOL
    └── stream.ts                 # Added TOOL_* events
```

## Security Considerations

1. **Token Storage** - Auth tokens are stored in Domo AppDB with access controlled by developer token
2. **Server Validation** - URLs are validated before connection
3. **Error Handling** - Sensitive errors are sanitized before returning to client
4. **Disabled Servers** - Tools from disabled servers are not exposed

## Testing

### Unit Tests

- `mcpRegistry.service.test.ts` - CRUD operations, encryption, tool sync
- `mcpHttpClient.test.ts` - Connection, auth, tool discovery, execution
- `mcp.controller.test.ts` - API endpoints
- `mcp.test.ts` (frontend) - API service functions

### Integration Tests

- `mcp-external.test.ts` - Full flow with mock MCP server
  - Add server → Test connection → Sync tools
  - Execute tools
  - Disable server → Tools hidden
  - Error handling

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DOMO_INSTANCE_URL` | Domo instance URL for AppDB | `https://domo-es.domo.com` |
| `DEV_TOKEN` | Domo developer token for API access | Required |

## Usage

### Adding an MCP Server

1. Navigate to `/integrations`
2. Click "Add Server"
3. Fill in server details (name, URL, auth)
4. Click "Add"
5. Click "Test" to verify connection
6. Click "Sync" to discover tools

### Using MCP Tools in Chat

1. Type `@` to open tool popup, or click the tool icon
2. Select tools from the list
3. Type your message
4. Send - tools will be executed and results included in context

## Future Enhancements

- SSE transport support for real-time updates
- Tool parameter form generation from JSON Schema
- Tool execution history/logging
- Server health monitoring
- Tool favorites/pinning
- Custom tool parameter presets
