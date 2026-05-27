import { createAppSlice } from '../createAppSlice';
import { fetchAgents } from './actions';
import { Agent } from 'models/interfaces/agent';

interface AgentsState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
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
      });
  },
  selectors: {
    selectAgents: (state: AgentsState) => state.agents,
    selectLoading: (state: AgentsState) => state.loading,
    selectError: (state: AgentsState) => state.error,
  },
});

export const { clearError } = AgentsSlice.actions;

export const { selectAgents, selectLoading, selectError } =
  AgentsSlice.selectors;

export default AgentsSlice.reducer;
