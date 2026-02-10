import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { PeopleService } from '../../services/people';
import { User, Group } from 'models/interfaces/mention';

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

export const fetchGroups = createAsyncThunk<
  Group[],
  void,
  { state: RootState }
>('people/fetchGroups', async (_, { getState }) => {
  const { groups } = getState().people;
  if (groups.length > 0) {
    return groups;
  }
  return PeopleService.getGroups();
});
