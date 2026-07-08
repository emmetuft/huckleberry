import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { FAKE_CANVASES, FAKE_SPACES } from 'constants/workspace';
import { Space, Canvas, SpaceFile } from 'models/interfaces/space';

interface SpacesState {
  spaces: Space[];
  canvases: Canvas[];
}

const initialState: SpacesState = {
  spaces: FAKE_SPACES,
  canvases: FAKE_CANVASES,
};

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    createCanvas: (state, action: PayloadAction<Canvas>) => {
      state.canvases.push(action.payload as any);
    },
    deleteCanvas: (state, action: PayloadAction<string>) => {
      state.canvases = state.canvases.filter((c) => c.id !== action.payload);
    },
    addFile: (
      state,
      action: PayloadAction<{ spaceId: string; file: SpaceFile }>,
    ) => {
      const space = state.spaces.find((s) => s.id === action.payload.spaceId);
      if (space) space.files.push(action.payload.file);
    },
  },
  selectors: {
    selectSpaces: (state) => state.spaces,
    selectCanvases: (state) => state.canvases,
  },
});

export const { createCanvas, deleteCanvas, addFile } = spacesSlice.actions;
export const { selectSpaces, selectCanvases } = spacesSlice.selectors;

export const selectSpaceById = (id: string) => (state: RootState) =>
  state.spaces.spaces.find((s) => s.id === id);

export const selectCanvasesBySpaceId =
  (spaceId: string) => (state: RootState) =>
    state.spaces.canvases.filter((c) => c.spaceId === spaceId);

export const selectFilesBySpaceId = (spaceId: string) => (state: RootState) =>
  state.spaces.spaces.find((s) => s.id === spaceId)?.files ?? [];

export default spacesSlice.reducer;
