/**
 * MCP (Model Context Protocol) Server Configuration
 * Defines the structure for external MCP server connections
 */

export interface MCPServerConfig {
  id: string;
  name: string;
  description?: string;
  url: string;
  transport: MCPTransportType;
  authType: MCPAuthType;
  authHeader?: string; // Custom header name for api-key auth (default: X-API-Key)
  authToken?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
  lastConnectedAt?: string;
  connectionStatus?: MCPConnectionStatus;
  tools: MCPToolDefinition[];
  /** @deprecated Use oauth2DiscoveredConfig instead */
  oauth2Config?: OAuth2Config;
  /** Discovery-based OAuth2 config (MCP spec compliant) */
  oauth2DiscoveredConfig?: OAuth2DiscoveredConfig;
  oauth2Status?: OAuth2AuthStatus;
  oauth2AuthorizedAt?: string;
  oauth2Error?: string;
}

export type MCPTransportType = 'http' | 'sse';

export type MCPAuthType = 'none' | 'bearer' | 'api-key' | 'oauth2';

/**
 * Legacy OAuth2Config - manual configuration (deprecated)
 * Kept for backwards compatibility during migration
 */
export interface OAuth2Config {
  authorizationUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret?: string;
  scopes: string[];
  redirectUri?: string;
}

/**
 * OAuth2 Discovered Config - MCP spec compliant discovery-based configuration
 * Populated automatically from protected resource and auth server metadata
 */
export interface OAuth2DiscoveredConfig {
  // Discovered from Protected Resource Metadata (RFC 9728)
  resourceMetadataUrl?: string;
  authorizationServers: string[];
  scopesSupported: string[];

  // Discovered from Auth Server Metadata (RFC 8414)
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  registrationEndpoint?: string; // For Dynamic Client Registration (RFC 7591)

  // User-provided (if not using DCR)
  clientId?: string;
  clientSecret?: string;

  // Discovery metadata
  discoveredAt?: number;
}

export interface OAuth2TokenData {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt?: number;
  issuedAt: number;
}

export type OAuth2AuthStatus =
  | 'not_configured'
  | 'discovering'
  | 'discovery_failed'
  | 'pending'
  | 'authorized'
  | 'expired'
  | 'error';

export type MCPConnectionStatus = 'connected' | 'disconnected' | 'error' | 'unknown';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  serverId: string;
  serverName?: string;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  description?: string;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface MCPToolResult {
  success: boolean;
  content?: unknown;
  error?: string;
  executionTime?: number;
}

export interface MCPToolCall {
  toolName: string;
  serverId: string;
  params: Record<string, unknown>;
}

export interface MCPServerCreateInput {
  name: string;
  description?: string;
  url: string;
  transport: MCPTransportType;
  authType: MCPAuthType;
  authHeader?: string;
  authToken?: string;
  enabled?: boolean;
  /** @deprecated Use clientId/clientSecret directly for manual OAuth2 */
  oauth2Config?: OAuth2Config;
  /** Optional client credentials (only if auth server doesn't support DCR) */
  oauth2ClientId?: string;
  oauth2ClientSecret?: string;
}

export interface MCPServerUpdateInput {
  name?: string;
  description?: string;
  url?: string;
  transport?: MCPTransportType;
  authType?: MCPAuthType;
  authHeader?: string;
  authToken?: string;
  enabled?: boolean;
  /** @deprecated Use oauth2DiscoveredConfig instead */
  oauth2Config?: OAuth2Config;
  /** Discovery-based OAuth2 config (MCP spec compliant) */
  oauth2DiscoveredConfig?: OAuth2DiscoveredConfig;
  oauth2Status?: OAuth2AuthStatus;
  oauth2AuthorizedAt?: string;
  oauth2Error?: string;
}

export interface MCPTestConnectionResult {
  success: boolean;
  message: string;
  tools?: MCPToolDefinition[];
  serverInfo?: {
    name?: string;
    version?: string;
    protocolVersion?: string;
  };
  /** Set when OAuth2 authorization is required (401 with WWW-Authenticate) */
  requiresOAuth2?: boolean;
  /** Discovered OAuth2 config when requiresOAuth2 is true */
  oauth2DiscoveredConfig?: OAuth2DiscoveredConfig;
}

/**
 * MCP JSON-RPC Protocol Interfaces
 * Based on the Model Context Protocol specification
 */

export interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface MCPInitializeResult {
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

export interface MCPListToolsResult {
  tools: Array<{
    name: string;
    description?: string;
    inputSchema: JSONSchema;
  }>;
}

export interface MCPCallToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
