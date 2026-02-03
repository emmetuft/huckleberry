import { createAsyncThunk } from '@reduxjs/toolkit';
import { MCPService } from '../../services/mcp';
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
