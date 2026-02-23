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
  initiateOAuth2Authorization,
  revokeOAuth2Authorization,
  fetchOAuth2Status,
  triggerOAuth2Discovery,
} from './actions';
import {
  MCPServerConfig,
  MCPToolDefinition,
  MCPTestConnectionResult,
} from 'models/interfaces/mcpServer';
import { OAuth2StatusResponse } from '../../services/mcp';

interface MCPState {
  servers: MCPServerConfig[];
  tools: MCPToolDefinition[];
  selectedServerId: string | null;
  loading: boolean;
  error: string | null;
  testingServerId: string | null;
  testResult: MCPTestConnectionResult | null;
  syncingServerId: string | null;
  authorizingServerId: string | null;
  discoveringServerId: string | null;
  oauth2Status: Record<string, OAuth2StatusResponse>;
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
  authorizingServerId: null,
  discoveringServerId: null,
  oauth2Status: {},
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
      })
      // OAuth2 authorization
      .addCase(initiateOAuth2Authorization.pending, (state, action) => {
        state.authorizingServerId = action.meta.arg;
      })
      .addCase(initiateOAuth2Authorization.fulfilled, (state) => {
        state.authorizingServerId = null;
      })
      .addCase(initiateOAuth2Authorization.rejected, (state, action) => {
        state.authorizingServerId = null;
        state.error = action.error.message || 'Failed to initiate OAuth2';
      })
      // OAuth2 revoke
      .addCase(revokeOAuth2Authorization.fulfilled, (state, action) => {
        const serverId = action.meta.arg;
        const serverIndex = state.servers.findIndex((s) => s.id === serverId);
        if (serverIndex !== -1) {
          state.servers[serverIndex].oauth2Status = 'not_configured';
          state.servers[serverIndex].oauth2AuthorizedAt = undefined;
          state.servers[serverIndex].oauth2Error = undefined;
        }
        delete state.oauth2Status[serverId];
      })
      // OAuth2 status
      .addCase(fetchOAuth2Status.fulfilled, (state, action) => {
        const { serverId, status } = action.payload;
        state.oauth2Status[serverId] = status;
      })
      // OAuth2 discovery
      .addCase(triggerOAuth2Discovery.pending, (state, action) => {
        state.discoveringServerId = action.meta.arg;
        // Update oauth2Status map to show discovering state
        state.oauth2Status[action.meta.arg] = {
          status: 'discovering',
        };
      })
      .addCase(triggerOAuth2Discovery.fulfilled, (state, action) => {
        state.discoveringServerId = null;
        const { serverId, discovery } = action.payload;
        const serverIndex = state.servers.findIndex((s) => s.id === serverId);
        if (serverIndex !== -1) {
          state.servers[serverIndex].oauth2DiscoveredConfig =
            discovery.discoveredConfig;
          state.servers[serverIndex].oauth2Status = 'pending';
        }
        // Update oauth2Status map so component sees the change
        state.oauth2Status[serverId] = {
          status: 'pending',
          discoveredConfig: discovery.discoveredConfig,
          scopesSupported: discovery.discoveredConfig.scopesSupported,
          hasClientId: !!discovery.discoveredConfig.clientId,
        };
      })
      .addCase(triggerOAuth2Discovery.rejected, (state, action) => {
        state.discoveringServerId = null;
        const serverId = action.meta.arg;
        const serverIndex = state.servers.findIndex((s) => s.id === serverId);
        if (serverIndex !== -1) {
          state.servers[serverIndex].oauth2Status = 'discovery_failed';
          state.servers[serverIndex].oauth2Error =
            action.error.message || 'Discovery failed';
        }
        // Update oauth2Status map
        state.oauth2Status[serverId] = {
          status: 'discovery_failed',
          error: action.error.message || 'Discovery failed',
        };
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
    selectAuthorizingServerId: (state: MCPState) => state.authorizingServerId,
    selectDiscoveringServerId: (state: MCPState) => state.discoveringServerId,
    selectOAuth2Status: (state: MCPState) => state.oauth2Status,
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
  selectAuthorizingServerId,
  selectDiscoveringServerId,
  selectOAuth2Status,
} = MCPSlice.selectors;

export default MCPSlice.reducer;
