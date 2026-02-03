import {
  MCPServerConfig,
  MCPServerCreateInput,
  MCPServerUpdateInput,
  MCPToolDefinition,
  MCPTestConnectionResult,
  MCPToolResult,
} from '../../shared/models/interfaces/mcpServer';

const MCP_API_BASE = '/api/mcp';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }

  return result.data as T;
}

export const createServer = async (
  input: MCPServerCreateInput,
): Promise<MCPServerConfig> => {
  const response = await fetch(`${MCP_API_BASE}/servers`, {
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
  const response = await fetch(url);
  return handleResponse<MCPServerConfig[]>(response);
};

export const getServer = async (id: string): Promise<MCPServerConfig> => {
  const response = await fetch(`${MCP_API_BASE}/servers/${id}`);
  return handleResponse<MCPServerConfig>(response);
};

export const updateServer = async (
  id: string,
  input: MCPServerUpdateInput,
): Promise<MCPServerConfig> => {
  const response = await fetch(`${MCP_API_BASE}/servers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<MCPServerConfig>(response);
};

export const deleteServer = async (
  id: string,
): Promise<{ deleted: boolean }> => {
  const response = await fetch(`${MCP_API_BASE}/servers/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ deleted: boolean }>(response);
};

export const testServerConnection = async (
  id: string,
): Promise<MCPTestConnectionResult> => {
  const response = await fetch(`${MCP_API_BASE}/servers/${id}/test`, {
    method: 'POST',
  });
  return handleResponse<MCPTestConnectionResult>(response);
};

export const syncServerTools = async (
  id: string,
): Promise<{ server: MCPServerConfig; toolCount: number }> => {
  const response = await fetch(`${MCP_API_BASE}/servers/${id}/sync`, {
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
  const response = await fetch(`${MCP_API_BASE}/servers/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  return handleResponse<MCPServerConfig>(response);
};

export const getTools = async (): Promise<MCPToolDefinition[]> => {
  const response = await fetch(`${MCP_API_BASE}/tools`);
  return handleResponse<MCPToolDefinition[]>(response);
};

export const executeTool = async (
  serverId: string,
  toolName: string,
  params?: Record<string, unknown>,
): Promise<MCPToolResult> => {
  const response = await fetch(`${MCP_API_BASE}/tools/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serverId, toolName, params }),
  });
  return handleResponse<MCPToolResult>(response);
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
};
