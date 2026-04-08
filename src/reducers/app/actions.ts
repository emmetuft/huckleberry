import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { Persona } from 'models/interfaces/persona';
import { StorageService } from 'services/storage';
import { IdentityService } from 'services/identity';

export const authenticate = createAsyncThunk<any, void>(
  'app/authenticate',
  IdentityService.authenticate,
);

export const fetchUserPersona = createAsyncThunk<
  Persona,
  void,
  { state: RootState }
>('app/fetchUserPersona', async (_, { getState }) => {
  const { identity } = getState().app;
  if (!identity) {
    throw new Error('User identity is not available');
  }
  return StorageService.fetchUserPersona(identity.id);
});

export const saveUserPersona = createAsyncThunk<
  Persona,
  Persona,
  { state: RootState }
>('app/saveUserPersona', async (persona: Persona, { getState }) => {
  const state = getState() as { app: { identity?: any } };
  const userId = state.app.identity?.userId;
  if (!userId) {
    throw new Error('User identity is not available');
  }
  const updatedPersona = await StorageService.saveUserPersona(userId, persona);
  return updatedPersona;
});
