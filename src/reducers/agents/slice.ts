import { createAppSlice } from '../createAppSlice';
import { createCustomAgent, fetchAgents, fetchAIModels } from './actions';
import { Agent } from 'models/interfaces/agent';
import { AIModel } from 'models/interfaces/aiModel';

interface AgentsState {
  agents: Agent[];
  aiModels: AIModel[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  aiModels: [],
  loading: false,
  error: null,
};

export const AgentsSlice = createAppSlice({
  name: 'agents',
  initialState,
  reducers: (create) => ({
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
      });
  },
  selectors: {
    selectAgents: (state: AgentsState) => state.agents,
    selectAIModels: (state: AgentsState) => state.aiModels,
    selectLoading: (state: AgentsState) => state.loading,
    selectError: (state: AgentsState) => state.error,
  },
});

export const { clearError } = AgentsSlice.actions;

export const { selectAgents, selectAIModels, selectLoading, selectError } =
  AgentsSlice.selectors;

export default AgentsSlice.reducer;
