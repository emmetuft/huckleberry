import { createAppSlice } from '../createAppSlice';
import {
  fetchServers,
  fetchTools,
  addServer,
  editServer,
  removeServer,
  testConnection,
  syncTools,
  toggleServerEnabled,
} from './actions';
import {
  MCPServerConfig,
  MCPToolDefinition,
  MCPTestConnectionResult,
} from '../../../shared/models/interfaces/mcpServer';

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

const initialState: MCPState = {
  servers: [],
  tools: [],
  selectedServerId: null,
  loading: false,
  error: null,
  testingServerId: null,
  testResult: null,
  syncingServerId: null,
};

export const MCPSlice = createAppSlice({
  name: 'mcp',
  initialState,
  reducers: (create) => ({
    setSelectedServer: create.reducer(
      (state, action: { payload: string | null }) => {
        state.selectedServerId = action.payload;
      },
    ),
    clearTestResult: create.reducer((state) => {
      state.testResult = null;
    }),
    clearError: create.reducer((state) => {
      state.error = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      // Fetch servers
      .addCase(fetchServers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServers.fulfilled, (state, action) => {
        state.loading = false;
        state.servers = action.payload;
      })
      .addCase(fetchServers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch servers';
      })
      // Fetch tools
      .addCase(fetchTools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.loading = false;
        state.tools = action.payload;
      })
      .addCase(fetchTools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tools';
      })
      // Add server
      .addCase(addServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addServer.fulfilled, (state, action) => {
        state.loading = false;
        state.servers.unshift(action.payload);
      })
      .addCase(addServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add server';
      })
      // Edit server
      .addCase(editServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editServer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.servers.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) {
          state.servers[index] = action.payload;
        }
      })
      .addCase(editServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update server';
      })
      // Remove server
      .addCase(removeServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeServer.fulfilled, (state, action) => {
        state.loading = false;
        state.servers = state.servers.filter((s) => s.id !== action.meta.arg);
        if (state.selectedServerId === action.meta.arg) {
          state.selectedServerId = null;
        }
      })
      .addCase(removeServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete server';
      })
      // Test connection
      .addCase(testConnection.pending, (state, action) => {
        state.testingServerId = action.meta.arg;
        state.testResult = null;
      })
      .addCase(testConnection.fulfilled, (state, action) => {
        state.testingServerId = null;
        state.testResult = action.payload;
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.testingServerId = null;
        state.testResult = {
          success: false,
          message: action.error.message || 'Connection test failed',
        };
      })
      // Sync tools
      .addCase(syncTools.pending, (state, action) => {
        state.syncingServerId = action.meta.arg;
      })
      .addCase(syncTools.fulfilled, (state, action) => {
        state.syncingServerId = null;
        const { server } = action.payload;
        const index = state.servers.findIndex((s) => s.id === server.id);
        if (index !== -1) {
          state.servers[index] = server;
        }
      })
      .addCase(syncTools.rejected, (state, action) => {
        state.syncingServerId = null;
        state.error = action.error.message || 'Failed to sync tools';
      })
      // Toggle server enabled
      .addCase(toggleServerEnabled.fulfilled, (state, action) => {
        const index = state.servers.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) {
          state.servers[index] = action.payload;
        }
      });
  },
  selectors: {
    selectServers: (state: MCPState) => state.servers,
    selectEnabledServers: (state: MCPState) =>
      state.servers.filter((s) => s.enabled),
    selectTools: (state: MCPState) => state.tools,
    selectToolsByServer: (state: MCPState) => {
      const grouped: Record<string, MCPToolDefinition[]> = {};
      for (const tool of state.tools) {
        if (!grouped[tool.serverId]) {
          grouped[tool.serverId] = [];
        }
        grouped[tool.serverId].push(tool);
      }
      return grouped;
    },
    selectSelectedServerId: (state: MCPState) => state.selectedServerId,
    selectSelectedServer: (state: MCPState) =>
      state.servers.find((s) => s.id === state.selectedServerId) || null,
    selectLoading: (state: MCPState) => state.loading,
    selectError: (state: MCPState) => state.error,
    selectTestingServerId: (state: MCPState) => state.testingServerId,
    selectTestResult: (state: MCPState) => state.testResult,
    selectSyncingServerId: (state: MCPState) => state.syncingServerId,
  },
});

export const { setSelectedServer, clearTestResult, clearError } =
  MCPSlice.actions;

export const {
  selectServers,
  selectEnabledServers,
  selectTools,
  selectToolsByServer,
  selectSelectedServerId,
  selectSelectedServer,
  selectLoading,
  selectError,
  selectTestingServerId,
  selectTestResult,
  selectSyncingServerId,
} = MCPSlice.selectors;

export default MCPSlice.reducer;
