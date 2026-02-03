import {
  MCPServerConfig,
  MCPToolDefinition,
  MCPToolResult,
  MCPTestConnectionResult,
  JSONSchema,
} from '../../shared/models/interfaces/mcpServer.js';

interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: {
    tools?: Record<string, unknown>;
    resources?: Record<string, unknown>;
    prompts?: Record<string, unknown>;
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

interface MCPListToolsResult {
  tools: Array<{
    name: string;
    description?: string;
    inputSchema: JSONSchema;
  }>;
}

interface MCPCallToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export class MCPHttpClient {
  private config: MCPServerConfig;
  private requestId: number = 0;
  private initialized: boolean = false;
  private serverInfo?: MCPInitializeResult['serverInfo'];
  private protocolVersion?: string;
  private sessionId?: string;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  private getNextRequestId(): number {
    return ++this.requestId;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authType === 'bearer' && this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    } else if (this.config.authType === 'api-key' && this.config.authToken) {
      const headerName = this.config.authHeader || 'X-API-Key';
      headers[headerName] = this.config.authToken;
    }

    // Include session ID if we have one (per MCP Streamable HTTP spec)
    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    return headers;
  }

  private async sendRequest(request: MCPRequest): Promise<MCPResponse> {
    const url = this.config.url;
    const headers = this.getAuthHeaders();

    // Log request details (mask sensitive values)
    const safeHeaders = { ...headers };
    for (const key of Object.keys(safeHeaders)) {
      if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key')) {
        safeHeaders[key] = safeHeaders[key] ? `[REDACTED ${safeHeaders[key].length} chars]` : '[EMPTY]';
      }
    }
    console.log(`[MCP] Request to ${url}`);
    console.log(`[MCP] Method: ${request.method}`);
    console.log(`[MCP] Headers:`, safeHeaders);
    console.log(`[MCP] Body:`, JSON.stringify(request, null, 2));
    console.log(`[MCP] Auth config: type=${this.config.authType}, header=${this.config.authHeader || '(default)'}, hasToken=${!!this.config.authToken}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(30000),
      });

      console.log(`[MCP] Response: ${response.status} ${response.statusText}`);

      // Capture session ID from response headers (MCP Streamable HTTP)
      const sessionId = response.headers.get('Mcp-Session-Id');
      if (sessionId) {
        console.log(`[MCP] Session ID: ${sessionId}`);
        this.sessionId = sessionId;
      }

      // Log all response headers for debugging
      console.log(`[MCP] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.log(`[MCP] Error body:`, errorBody);
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[MCP] Response body:`, JSON.stringify(data, null, 2));
      return data as MCPResponse;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          throw new Error('Connection timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async connect(): Promise<void> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {},
        },
        clientInfo: {
          name: 'huckleberry',
          version: '1.0.0',
        },
      },
    };

    const response = await this.sendRequest(request);

    if (response.error) {
      throw new Error(`Initialize failed: ${response.error.message}`);
    }

    const result = response.result as MCPInitializeResult;
    this.serverInfo = result.serverInfo;
    this.protocolVersion = result.protocolVersion;
    this.initialized = true;

    // Send initialized notification (no id per MCP spec for notifications)
    const notifyRequest = {
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    };
    await fetch(this.config.url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notifyRequest),
    }).catch(() => {
      // Notifications don't require responses
    });
  }

  async listTools(): Promise<MCPToolDefinition[]> {
    if (!this.initialized) {
      await this.connect();
    }

    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/list',
      params: {},
    };

    const response = await this.sendRequest(request);

    if (response.error) {
      throw new Error(`List tools failed: ${response.error.message}`);
    }

    const result = response.result as MCPListToolsResult;

    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || '',
      inputSchema: tool.inputSchema || { type: 'object' },
      serverId: this.config.id,
    }));
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.initialized) {
      await this.connect();
    }

    const startTime = Date.now();

    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name,
        arguments: params,
      },
    };

    try {
      const response = await this.sendRequest(request);
      const executionTime = Date.now() - startTime;

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
          executionTime,
        };
      }

      const result = response.result as MCPCallToolResult;

      if (result.isError) {
        const errorText = result.content
          .filter((c) => c.type === 'text')
          .map((c) => c.text)
          .join('\n');
        return {
          success: false,
          error: errorText || 'Tool execution failed',
          executionTime,
        };
      }

      const content = result.content.map((c) => {
        if (c.type === 'text') {
          return c.text;
        } else if (c.type === 'image' || c.type === 'resource') {
          return { type: c.type, data: c.data, mimeType: c.mimeType };
        }
        return c;
      });

      return {
        success: true,
        content: content.length === 1 ? content[0] : content,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  async disconnect(): Promise<void> {
    this.initialized = false;
    this.serverInfo = undefined;
    this.protocolVersion = undefined;
  }

  async testConnection(): Promise<MCPTestConnectionResult> {
    try {
      await this.connect();
      const tools = await this.listTools();

      return {
        success: true,
        message: `Successfully connected to ${this.serverInfo?.name || 'MCP server'}`,
        tools,
        serverInfo: {
          name: this.serverInfo?.name,
          version: this.serverInfo?.version,
          protocolVersion: this.protocolVersion,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  getServerInfo(): { name?: string; version?: string; protocolVersion?: string } | undefined {
    if (!this.initialized) return undefined;
    return {
      name: this.serverInfo?.name,
      version: this.serverInfo?.version,
      protocolVersion: this.protocolVersion,
    };
  }

  isConnected(): boolean {
    return this.initialized;
  }
}

const clientCache = new Map<string, MCPHttpClient>();

export function getMCPClient(config: MCPServerConfig): MCPHttpClient {
  let client = clientCache.get(config.id);
  if (!client) {
    client = new MCPHttpClient(config);
    clientCache.set(config.id, client);
  }
  return client;
}

export function removeMCPClient(serverId: string): void {
  const client = clientCache.get(serverId);
  if (client) {
    client.disconnect();
    clientCache.delete(serverId);
  }
}

export function clearMCPClients(): void {
  for (const [, client] of clientCache) {
    client.disconnect();
  }
  clientCache.clear();
}
