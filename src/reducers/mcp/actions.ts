import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  MCPService,
  OAuth2AuthorizationResponse,
  OAuth2StatusResponse,
  OAuth2DiscoveryResponse,
} from '../../services/mcp';
import {
  MCPServerConfig,
  MCPServerCreateInput,
  MCPServerUpdateInput,
  MCPToolDefinition,
  MCPTestConnectionResult,
} from '../../../shared/models/interfaces/mcpServer';

export const fetchServers = createAsyncThunk<MCPServerConfig[]>(
  'mcp/fetchServers',
  async () => {
    return MCPService.getServers();
  },
);

export const fetchTools = createAsyncThunk<MCPToolDefinition[]>(
  'mcp/fetchTools',
  async () => {
    return MCPService.getTools();
  },
);

export const addServer = createAsyncThunk<
  MCPServerConfig,
  MCPServerCreateInput
>('mcp/addServer', async (input) => {
  return MCPService.createServer(input);
});

export const editServer = createAsyncThunk<
  MCPServerConfig,
  { id: string; input: MCPServerUpdateInput }
>('mcp/editServer', async ({ id, input }) => {
  return MCPService.updateServer(id, input);
});

export const removeServer = createAsyncThunk<{ deleted: boolean }, string>(
  'mcp/removeServer',
  async (id) => {
    return MCPService.deleteServer(id);
  },
);

export const testConnection = createAsyncThunk<MCPTestConnectionResult, string>(
  'mcp/testConnection',
  async (id) => {
    return MCPService.testServerConnection(id);
  },
);

export const syncTools = createAsyncThunk<
  { server: MCPServerConfig; toolCount: number },
  string
>('mcp/syncTools', async (id) => {
  return MCPService.syncServerTools(id);
});

export const toggleServerEnabled = createAsyncThunk<
  MCPServerConfig,
  { id: string; enabled: boolean }
>('mcp/toggleServerEnabled', async ({ id, enabled }) => {
  return MCPService.toggleServer(id, enabled);
});

// OAuth2 thunks
export const initiateOAuth2Authorization = createAsyncThunk<
  OAuth2AuthorizationResponse,
  string
>('mcp/initiateOAuth2', async (serverId) => {
  return MCPService.initiateOAuth2(serverId);
});

export const revokeOAuth2Authorization = createAsyncThunk<
  { revoked: boolean },
  string
>('mcp/revokeOAuth2', async (serverId) => {
  return MCPService.revokeOAuth2(serverId);
});

export const fetchOAuth2Status = createAsyncThunk<
  { serverId: string; status: OAuth2StatusResponse },
  string
>('mcp/fetchOAuth2Status', async (serverId) => {
  const status = await MCPService.getOAuth2Status(serverId);
  return { serverId, status };
});

export const triggerOAuth2Discovery = createAsyncThunk<
  { serverId: string; discovery: OAuth2DiscoveryResponse },
  string
>('mcp/triggerOAuth2Discovery', async (serverId) => {
  const discovery = await MCPService.discoverOAuth2(serverId);
  return { serverId, discovery };
});
