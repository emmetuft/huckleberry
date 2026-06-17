import { apiFetch } from 'services/headers';
import {
  MCPServerConfig,
  MCPServerCreateInput,
  MCPServerUpdateInput,
  MCPToolDefinition,
  MCPTestConnectionResult,
  MCPToolResult,
  OAuth2AuthStatus,
  OAuth2DiscoveredConfig,
} from 'models/interfaces/mcpServer';
import { handleResponse } from 'utils/service';

const MCP_API_BASE = '/api/mcp';

export const createServer = async (
  input: MCPServerCreateInput,
): Promise<MCPServerConfig> => {
  const response = await apiFetch(`${MCP_API_BASE}/servers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<MCPServerConfig>(response);
};

export const getServers = async (
  enabledOnly = false,
): Promise<MCPServerConfig[]> => {
  const url = enabledOnly
    ? `${MCP_API_BASE}/servers?enabled=true`
    : `${MCP_API_BASE}/servers`;
  const response = await apiFetch(url);
  return handleResponse<MCPServerConfig[]>(response);
};

export const getServer = async (id: string): Promise<MCPServerConfig> => {
  const response = await apiFetch(`${MCP_API_BASE}/servers/${id}`);
  return handleResponse<MCPServerConfig>(response);
};

export const updateServer = async (
  id: string,
  input: MCPServerUpdateInput,
): Promise<MCPServerConfig> => {
  const response = await apiFetch(`${MCP_API_BASE}/servers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<MCPServerConfig>(response);
};

export const deleteServer = async (
  id: string,
): Promise<{ deleted: boolean }> => {
  const response = await apiFetch(`${MCP_API_BASE}/servers/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ deleted: boolean }>(response);
};

export const testServerConnection = async (
  id: string,
): Promise<MCPTestConnectionResult> => {
  const response = await apiFetch(`${MCP_API_BASE}/servers/${id}/test`, {
    method: 'POST',
  });
  return handleResponse<MCPTestConnectionResult>(response);
};

export const syncServerTools = async (
  id: string,
): Promise<{ server: MCPServerConfig; toolCount: number }> => {
  const response = await apiFetch(`${MCP_API_BASE}/servers/${id}/sync`, {
    method: 'POST',
  });
  return handleResponse<{ server: MCPServerConfig; toolCount: number }>(
    response,
  );
};

export const toggleServer = async (
  id: string,
  enabled: boolean,
): Promise<MCPServerConfig> => {
  const response = await apiFetch(`${MCP_API_BASE}/servers/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  return handleResponse<MCPServerConfig>(response);
};

export const getTools = async (): Promise<MCPToolDefinition[]> => {
  const response = await apiFetch(`${MCP_API_BASE}/tools`);
  return handleResponse<MCPToolDefinition[]>(response);
};

export const executeTool = async (
  serverId: string,
  toolName: string,
  params?: Record<string, unknown>,
): Promise<MCPToolResult> => {
  const response = await apiFetch(`${MCP_API_BASE}/tools/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serverId, toolName, params }),
  });
  return handleResponse<MCPToolResult>(response);
};

// OAuth2 API methods
export interface OAuth2AuthorizationResponse {
  authorizationUrl: string;
  state: string;
}

export interface OAuth2StatusResponse {
  status: OAuth2AuthStatus;
  authorizedAt?: string;
  error?: string;
  discoveredConfig?: OAuth2DiscoveredConfig;
  hasClientId?: boolean;
  scopesSupported?: string[];
}

export interface OAuth2DiscoveryResponse {
  discoveredConfig: OAuth2DiscoveredConfig;
  message: string;
}

export const initiateOAuth2 = async (
  serverId: string,
): Promise<OAuth2AuthorizationResponse> => {
  const response = await apiFetch(
    `${MCP_API_BASE}/oauth2/authorize/${serverId}`,
  );
  return handleResponse<OAuth2AuthorizationResponse>(response);
};

export const revokeOAuth2 = async (
  serverId: string,
): Promise<{ revoked: boolean }> => {
  const response = await apiFetch(`${MCP_API_BASE}/oauth2/revoke/${serverId}`, {
    method: 'POST',
  });
  return handleResponse<{ revoked: boolean }>(response);
};

export const getOAuth2Status = async (
  serverId: string,
): Promise<OAuth2StatusResponse> => {
  const response = await apiFetch(`${MCP_API_BASE}/oauth2/status/${serverId}`);
  return handleResponse<OAuth2StatusResponse>(response);
};

export const discoverOAuth2 = async (
  serverId: string,
): Promise<OAuth2DiscoveryResponse> => {
  const response = await apiFetch(
    `${MCP_API_BASE}/oauth2/discover/${serverId}`,
    {
      method: 'POST',
    },
  );
  return handleResponse<OAuth2DiscoveryResponse>(response);
};

export const MCPService = {
  createServer,
  getServers,
  getServer,
  updateServer,
  deleteServer,
  testServerConnection,
  syncServerTools,
  toggleServer,
  getTools,
  executeTool,
  initiateOAuth2,
  revokeOAuth2,
  getOAuth2Status,
  discoverOAuth2,
};
