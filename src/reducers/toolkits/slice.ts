import { createAppSlice } from '../createAppSlice';
import { fetchToolkits, searchToolkits } from './actions';
import { Toolkit, ToolkitSearchResult } from 'models/interfaces/toolkit';

interface ToolkitsState {
  toolkits: Toolkit[];
  searchResults: ToolkitSearchResult[];
  loading: boolean;
  searching: boolean;
  error: string | null;
}

const initialState: ToolkitsState = {
  toolkits: [],
  searchResults: [],
  loading: false,
  searching: false,
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
      })
      .addCase(searchToolkits.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchToolkits.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchToolkits.rejected, (state, action) => {
        state.searching = false;
        state.error = action.error.message || 'Failed to search toolkits';
      });
  },
  selectors: {
    selectToolkits: (state: ToolkitsState) => state.toolkits,
    selectSearchResults: (state: ToolkitsState) => state.searchResults,
    selectLoading: (state: ToolkitsState) => state.loading,
    selectSearching: (state: ToolkitsState) => state.searching,
    selectError: (state: ToolkitsState) => state.error,
  },
});

export const { clearError } = ToolkitsSlice.actions;

export const {
  selectToolkits,
  selectSearchResults,
  selectLoading,
  selectSearching,
  selectError,
} = ToolkitsSlice.selectors;

export default ToolkitsSlice.reducer;
