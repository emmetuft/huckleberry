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
}

export type MCPTransportType = 'http' | 'sse';

export type MCPAuthType = 'none' | 'bearer' | 'api-key';

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
}
