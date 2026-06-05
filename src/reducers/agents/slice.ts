import { createAppSlice } from '../createAppSlice';
import {
  createCustomAgent,
  fetchAgentById,
  fetchAgents,
  fetchAIModels,
} from './actions';
import { Agent } from 'models/interfaces/agent';
import { AIModel } from 'models/interfaces/aiModel';

interface AgentsState {
  agents: Agent[];
  aiModels: AIModel[];
  loading: boolean;
  loadingAgentId: string | null;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  aiModels: [],
  loading: false,
  loadingAgentId: null,
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
      .addCase(createCustomAgent.fulfilled, (state, action) => {
        state.agents.push(action.payload);
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
    selectError: (state: AgentsState) => state.error,
  },
});

export const { setAgents, clearError } = AgentsSlice.actions;

export const {
  selectAgents,
  selectAIModels,
  selectLoading,
  selectLoadingAgentId,
  selectError,
} = AgentsSlice.selectors;

export default AgentsSlice.reducer;
