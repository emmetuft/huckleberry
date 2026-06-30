import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Space, Canvas } from 'models/interfaces/space';
import { RootState } from 'reducers';

interface SpacesState {
  spaces: Space[];
  canvases: Canvas[];
}

const FAKE_SPACES: Space[] = [
  {
    id: '1',
    name: 'Demo',
    description: 'A shared exploration space for demo purposes.',
    memberIds: [1, 2, 3],
    createdAt: 'Jun 1, 2026',
    updatedAt: 'Jun 1, 2026',
  },
  {
    id: 'space-revenue',
    name: 'Revenue Growth',
    description:
      'Analyze and optimize revenue streams, track KPIs, and align team goals.',
    memberIds: [1, 2],
    createdAt: 'Jun 5, 2026',
    updatedAt: 'Jun 5, 2026',
  },
  {
    id: 'space-cx',
    name: 'Customer Insights',
    description:
      'Understand customer behavior, map journeys, and surface retention signals.',
    memberIds: [2, 3],
    createdAt: 'Jun 10, 2026',
    updatedAt: 'Jun 10, 2026',
  },
];

const FAKE_CANVASES: Canvas[] = [
  {
    id: 'canvas-1',
    spaceId: '1',
    intent: 'Map out Q3 revenue drivers and blockers',
    ownerId: 1,
    ownerName: 'John Doe',
    createdAt: 'Jun 15, 2026',
    updatedAt: 'Jun 15, 2026',
  },
  {
    id: 'canvas-2',
    spaceId: '1',
    intent: 'Understand churn signals in the enterprise segment',
    ownerId: 2,
    ownerName: 'Jane Smith',
    createdAt: 'Jun 20, 2026',
    updatedAt: 'Jun 20, 2026',
  },
  {
    id: 'canvas-3',
    spaceId: 'space-revenue',
    intent: 'Analyze onboarding drop-off across cohorts',
    ownerId: 3,
    ownerName: 'Alice Johnson',
    createdAt: 'Jun 22, 2026',
    updatedAt: 'Jun 22, 2026',
  },
];

const initialState: SpacesState = {
  spaces: FAKE_SPACES,
  canvases: FAKE_CANVASES,
};

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    createCanvas: (state, action: PayloadAction<Canvas>) => {
      state.canvases.push(action.payload);
    },
  },
  selectors: {
    selectSpaces: (state) => state.spaces,
    selectCanvases: (state) => state.canvases,
  },
});

export const { createCanvas } = spacesSlice.actions;
export const { selectSpaces, selectCanvases } = spacesSlice.selectors;

export const selectSpaceById = (id: string) => (state: RootState) =>
  state.spaces.spaces.find((s) => s.id === id);

export const selectCanvasesBySpaceId =
  (spaceId: string) => (state: RootState) =>
    state.spaces.canvases.filter((c) => c.spaceId === spaceId);

export default spacesSlice.reducer;
