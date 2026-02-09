import { createAppSlice } from '../createAppSlice';
import { fetchUsers, fetchTeams } from './actions';
import { User, Team } from 'models/interfaces/mention';

interface PeopleState {
  users: User[];
  teams: Team[];
  loading: boolean;
  error: string | null;
}

const initialState: PeopleState = {
  users: [],
  teams: [],
  loading: false,
  error: null,
};

export const PeopleSlice = createAppSlice({
  name: 'people',
  initialState,
  reducers: (create) => ({
    clearError: create.reducer((state) => {
      state.error = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch teams';
      });
  },
  selectors: {
    selectUsers: (state: PeopleState) => state.users,
    selectTeams: (state: PeopleState) => state.teams,
    selectAllPeople: (state: PeopleState) => [...state.users, ...state.teams],
    selectLoading: (state: PeopleState) => state.loading,
    selectError: (state: PeopleState) => state.error,
  },
});

export const { clearError } = PeopleSlice.actions;

export const {
  selectUsers,
  selectTeams,
  selectAllPeople,
  selectLoading,
  selectError,
} = PeopleSlice.selectors;

export default PeopleSlice.reducer;
