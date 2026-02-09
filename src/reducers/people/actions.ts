import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { PeopleService } from '../../services/people';
import { User, Team } from 'models/interfaces/mention';

export const fetchUsers = createAsyncThunk<User[], void, { state: RootState }>(
  'people/fetchUsers',
  async (_, { getState }) => {
    const { users } = getState().people;
    if (users.length > 0) {
      return users;
    }
    return PeopleService.getUsers();
  },
);

export const fetchTeams = createAsyncThunk<Team[], void, { state: RootState }>(
  'people/fetchTeams',
  async (_, { getState }) => {
    const { teams } = getState().people;
    if (teams.length > 0) {
      return teams;
    }
    return PeopleService.getTeams();
  },
);
