import {
  MCPServerConfig,
  MCPToolDefinition,
  MCPToolResult,
  MCPTestConnectionResult,
  MCPRequest,
  MCPResponse,
  MCPInitializeResult,
  MCPListToolsResult,
  MCPCallToolResult,
} from '../../shared/models/interfaces/mcpServer.js';
import { OAuth2AuthorizationRequiredError } from '../../shared/models/errors/oauth2.error.js';
import { oauth2Service } from './oauth2.service.js';

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

  private getBaseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Include session ID if we have one (per MCP Streamable HTTP spec)
    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    return headers;
  }

  private async getAuthHeaders(skipOAuth2 = false): Promise<Record<string, string>> {
    const headers = this.getBaseHeaders();

    if (this.config.authType === 'bearer' && this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    } else if (this.config.authType === 'api-key' && this.config.authToken) {
      const headerName = this.config.authHeader || 'X-API-Key';
      headers[headerName] = this.config.authToken;
    } else if (this.config.authType === 'oauth2' && !skipOAuth2) {
      // Try discovered config first, fall back to legacy config
      const discoveredConfig = this.config.oauth2DiscoveredConfig;
      const legacyConfig = this.config.oauth2Config;

      let accessToken: string | null = null;

      if (discoveredConfig?.clientId) {
        accessToken = await oauth2Service.getValidAccessTokenWithDiscoveredConfig(
          this.config.id,
          discoveredConfig,
        );
      } else if (legacyConfig) {
        accessToken = await oauth2Service.getValidAccessToken(
          this.config.id,
          legacyConfig,
        );
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      // Don't throw here - let the request proceed and handle 401 for discovery
    }

    return headers;
  }

  private async sendRequest(request: MCPRequest, skipOAuth2Discovery = false): Promise<MCPResponse> {
    const url = this.config.url;
    const headers = await this.getAuthHeaders(skipOAuth2Discovery);

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

      // Handle 401 Unauthorized - trigger OAuth2 discovery if applicable
      if (response.status === 401 && this.config.authType === 'oauth2' && !skipOAuth2Discovery) {
        const wwwAuth = response.headers.get('WWW-Authenticate');
        console.log(`[MCP] 401 received, WWW-Authenticate: ${wwwAuth}`);

        if (wwwAuth) {
          // Try to discover OAuth2 config from the response
          const discoveredConfig = await oauth2Service.discoverFromWWWAuthenticate(
            this.config.url,
            wwwAuth,
          );

          if (discoveredConfig) {
            // Preserve any existing client credentials
            if (this.config.oauth2DiscoveredConfig?.clientId && !discoveredConfig.clientId) {
              discoveredConfig.clientId = this.config.oauth2DiscoveredConfig.clientId;
            }
            if (this.config.oauth2DiscoveredConfig?.clientSecret && !discoveredConfig.clientSecret) {
              discoveredConfig.clientSecret = this.config.oauth2DiscoveredConfig.clientSecret;
            }

            throw new OAuth2AuthorizationRequiredError(this.config.id, discoveredConfig);
          }
        }

        // If no WWW-Authenticate or discovery failed, try direct discovery for OAuth2 servers
        try {
          const discoveredConfig = await oauth2Service.discoverOAuth2Config(this.config.url);

          // Preserve any existing client credentials
          if (this.config.oauth2DiscoveredConfig?.clientId && !discoveredConfig.clientId) {
            discoveredConfig.clientId = this.config.oauth2DiscoveredConfig.clientId;
          }
          if (this.config.oauth2DiscoveredConfig?.clientSecret && !discoveredConfig.clientSecret) {
            discoveredConfig.clientSecret = this.config.oauth2DiscoveredConfig.clientSecret;
          }

          throw new OAuth2AuthorizationRequiredError(this.config.id, discoveredConfig);
        } catch (error) {
          if (error instanceof OAuth2AuthorizationRequiredError) {
            throw error;
          }
          console.log(`[MCP] OAuth2 discovery failed, returning 401 error`);
        }
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.log(`[MCP] Error body:`, errorBody);
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[MCP] Response body:`, JSON.stringify(data, null, 2));
      return data as MCPResponse;
    } catch (error) {
      if (error instanceof OAuth2AuthorizationRequiredError) {
        throw error;
      }
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
    const notifyHeaders = await this.getAuthHeaders();
    await fetch(this.config.url, {
      method: 'POST',
      headers: notifyHeaders,
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
      // Handle OAuth2 authorization required
      if (error instanceof OAuth2AuthorizationRequiredError) {
        return {
          success: false,
          message: 'OAuth2 authorization required',
          requiresOAuth2: true,
          oauth2DiscoveredConfig: error.discoveredConfig,
        };
      }

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

  /**
   * Update the server config (e.g., after OAuth2 discovery)
   */
  updateConfig(config: MCPServerConfig): void {
    this.config = config;
  }

  /**
   * Get the current config
   */
  getConfig(): MCPServerConfig {
    return this.config;
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
