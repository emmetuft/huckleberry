import { createAppSlice } from '../createAppSlice';
import {
  deleteCustomAgent,
  fetchAgentById,
  fetchAgents,
  fetchAIModels,
  fetchAllSessions,
  fetchSessions,
  upsertCustomAgent,
} from './actions';
import { Agent } from 'models/interfaces/agent';
import { AIModel } from 'models/interfaces/aiModel';
import { AgentSession } from 'models/interfaces/session';

interface AgentsState {
  agents: Agent[];
  agentSessions: AgentSession[];
  allSessions: AgentSession[];
  loadingAllSessions: boolean;
  aiModels: AIModel[];
  loading: boolean;
  loadingAgentId: string | null;
  upserting: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  agentSessions: [],
  allSessions: [],
  loadingAllSessions: false,
  aiModels: [],
  loading: false,
  loadingAgentId: null,
  upserting: false,
  error: null,
};

export const AgentsSlice = createAppSlice({
  name: 'agents',
  initialState,
  reducers: (create) => ({
    setAgents: create.reducer((state, action: { payload: Agent[] }) => {
      state.agents = action.payload;
    }),
    clearError: create.reducer((state) => {
      state.error = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agents';
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sessions';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.agentSessions = action.payload;
      })
      .addCase(fetchAllSessions.pending, (state) => {
        state.loadingAllSessions = true;
        state.error = null;
      })
      .addCase(fetchAllSessions.rejected, (state, action) => {
        state.loadingAllSessions = false;
        state.error = action.error.message || 'Failed to fetch all sessions';
      })
      .addCase(fetchAllSessions.fulfilled, (state, action) => {
        state.loadingAllSessions = false;
        state.allSessions = action.payload;
      })
      .addCase(fetchAIModels.fulfilled, (state, action) => {
        state.aiModels = action.payload;
      })
      .addCase(upsertCustomAgent.pending, (state) => {
        state.upserting = true;
        state.error = null;
      })
      .addCase(upsertCustomAgent.rejected, (state, action) => {
        state.upserting = false;
        state.error = action.error.message || 'Failed to save agent';
      })
      .addCase(upsertCustomAgent.fulfilled, (state, action) => {
        state.upserting = false;
        const index = state.agents.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.agents[index] = action.payload;
        } else {
          state.agents.push(action.payload);
        }
      })
      .addCase(fetchAgentById.pending, (state, action) => {
        state.loadingAgentId = action.meta.arg;
      })
      .addCase(fetchAgentById.rejected, (state) => {
        state.loadingAgentId = null;
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.loadingAgentId = null;
        const exists = state.agents.some((a) => a.id === action.payload.id);
        if (!exists) {
          state.agents.push(action.payload);
        }
      })
      .addCase(deleteCustomAgent.fulfilled, (state, action) => {
        const agentId = action.payload;
        state.agents = state.agents.filter((a) => a.id !== agentId);
      });
  },
  selectors: {
    selectAgents: (state: AgentsState) => state.agents,
    selectAgentSessions: (state: AgentsState) => state.agentSessions,
    selectAllSessions: (state: AgentsState) => state.allSessions,
    selectLoadingAllSessions: (state: AgentsState) => state.loadingAllSessions,
    selectAIModels: (state: AgentsState) => state.aiModels,
    selectLoading: (state: AgentsState) => state.loading,
    selectLoadingAgentId: (state: AgentsState) => state.loadingAgentId,
    selectUpserting: (state: AgentsState) => state.upserting,
    selectError: (state: AgentsState) => state.error,
  },
});

export const { setAgents, clearError } = AgentsSlice.actions;

export const {
  selectAgents,
  selectAgentSessions,
  selectAllSessions,
  selectLoadingAllSessions,
  selectAIModels,
  selectLoading,
  selectLoadingAgentId,
  selectUpserting,
  selectError,
} = AgentsSlice.selectors;

export default AgentsSlice.reducer;
