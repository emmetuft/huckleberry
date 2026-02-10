import { createAppSlice } from '../createAppSlice';
import { fetchUsers, fetchGroups } from './actions';
import { User, Group } from 'models/interfaces/mention';

interface PeopleState {
  users: User[];
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: PeopleState = {
  users: [],
  groups: [],
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
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch groups';
      });
  },
  selectors: {
    selectUsers: (state: PeopleState) => state.users,
    selectGroups: (state: PeopleState) => state.groups,
    selectAllPeople: (state: PeopleState) => [...state.users, ...state.groups],
    selectLoading: (state: PeopleState) => state.loading,
    selectError: (state: PeopleState) => state.error,
  },
});

export const { clearError } = PeopleSlice.actions;

export const {
  selectUsers,
  selectGroups,
  selectAllPeople,
  selectLoading,
  selectError,
} = PeopleSlice.selectors;

export default PeopleSlice.reducer;
