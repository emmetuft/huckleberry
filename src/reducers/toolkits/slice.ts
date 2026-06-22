import { createAppSlice } from '../createAppSlice';
import { fetchToolkits } from './actions';
import { Toolkit } from 'models/interfaces/toolkit';

interface ToolkitsState {
  toolkits: Toolkit[];
  loading: boolean;
  error: string | null;
}

const initialState: ToolkitsState = {
  toolkits: [],
  loading: false,
  error: null,
};

export const ToolkitsSlice = createAppSlice({
  name: 'toolkits',
  initialState,
  reducers: (create) => ({
    clearError: create.reducer((state) => {
      state.error = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchToolkits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchToolkits.fulfilled, (state, action) => {
        state.loading = false;
        state.toolkits = action.payload;
      })
      .addCase(fetchToolkits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch toolkits';
      });
  },
  selectors: {
    selectToolkits: (state: ToolkitsState) => state.toolkits,
    selectLoading: (state: ToolkitsState) => state.loading,
    selectError: (state: ToolkitsState) => state.error,
  },
});

export const { clearError } = ToolkitsSlice.actions;

export const { selectToolkits, selectLoading, selectError } =
  ToolkitsSlice.selectors;

export default ToolkitsSlice.reducer;
