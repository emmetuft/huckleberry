import { createAppSlice } from '../createAppSlice';
import {
  createCustomAgent,
  fetchAgentById,
  fetchAgents,
  fetchAIModels,
  updateCustomAgent,
} from './actions';
import { Agent } from 'models/interfaces/agent';
import { AIModel } from 'models/interfaces/aiModel';

interface AgentsState {
  agents: Agent[];
  aiModels: AIModel[];
  loading: boolean;
  loadingAgentId: string | null;
  upserting: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
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
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agents';
      })
      .addCase(fetchAIModels.fulfilled, (state, action) => {
        state.aiModels = action.payload;
      })
      .addCase(createCustomAgent.pending, (state, action) => {
        state.upserting = true;
        state.error = null;
      })
      .addCase(createCustomAgent.rejected, (state, action) => {
        state.upserting = false;
        state.error = action.error.message || 'Failed to create agent';
      })
      .addCase(createCustomAgent.fulfilled, (state, action) => {
        state.upserting = false;
        state.agents.push(action.payload);
      })
      .addCase(updateCustomAgent.pending, (state, action) => {
        state.upserting = true;
        state.error = null;
      })
      .addCase(updateCustomAgent.rejected, (state, action) => {
        state.upserting = false;
        state.error = action.error.message || 'Failed to update agent';
      })
      .addCase(updateCustomAgent.fulfilled, (state, action) => {
        state.upserting = false;
        const index = state.agents.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.agents[index] = action.payload;
        }
      })
      .addCase(fetchAgentById.pending, (state, action) => {
        state.loadingAgentId = action.meta.arg;
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.loadingAgentId = null;
        const exists = state.agents.some((a) => a.id === action.payload.id);
        if (!exists) {
          state.agents.push(action.payload);
        }
      })
      .addCase(fetchAgentById.rejected, (state) => {
        state.loadingAgentId = null;
      });
  },
  selectors: {
    selectAgents: (state: AgentsState) => state.agents,
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
  selectAIModels,
  selectLoading,
  selectLoadingAgentId,
  selectUpserting,
  selectError,
} = AgentsSlice.selectors;

export default AgentsSlice.reducer;
