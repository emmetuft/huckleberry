import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { Persona } from 'models/interfaces/persona';
import { StorageService } from 'services/storage';

export const fetchUserPersona = createAsyncThunk<
  Persona,
  void,
  { state: RootState }
>('app/fetchUserPersona', async (params, { getState }) => {
  const { identity } = getState().app;
  if (!identity) {
    throw new Error('User identity is not available');
  }
  return StorageService.fetchUserPersona(identity.userId);
});
