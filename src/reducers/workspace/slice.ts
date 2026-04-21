import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  dismissedCards: string[];
}

const initialState: WorkspaceState = {
  dismissedCards: [],
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    dismissCard: (state, action: PayloadAction<string>) => {
      if (!state.dismissedCards.includes(action.payload)) {
        state.dismissedCards.push(action.payload);
      }
    },
  },
  selectors: {
    selectDismissedCards: (state) => state.dismissedCards,
  },
});

export const { dismissCard } = workspaceSlice.actions;
export const { selectDismissedCards } = workspaceSlice.selectors;
export default workspaceSlice.reducer;
