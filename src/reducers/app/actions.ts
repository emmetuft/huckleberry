import { createAsyncThunk } from '@reduxjs/toolkit';
import { Identity } from '@domoinc/toolkit';
import { AuthResponse } from '@appteam6/domoapps.js';
import { RootState } from 'reducers';
import { Persona } from '../../../shared/models/interfaces/persona';
import { StorageService } from 'services/storage';
import { AppService } from 'services/app';
import { defaultPersona } from 'constants/persona';

export const authenticate = createAsyncThunk<AuthResponse, void>(
  'app/authenticate',
  AppService.authenticate,
);

export const fetchIdentity = createAsyncThunk<Identity, void>(
  'app/fetchIdentity',
  async () => {
    const identity = await AppService.fetchIdentity();
    return identity;
  },
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
  return StorageService.fetchUserPersona(identity.userId);
});

export const saveUserPersona = createAsyncThunk<
  Persona,
  Persona,
  { state: RootState }
>('app/saveUserPersona', async (persona: Persona, { getState }) => {
  const state = getState() as { app: { identity?: Identity } };
  const userId = state.app.identity?.userId;
  if (!userId) {
    throw new Error('User identity is not available');
  }
  const updatedPersona = await StorageService.saveUserPersona(userId, persona);
  return updatedPersona;
});

export const swapPersona = createAsyncThunk<
  Persona,
  number,
  { state: RootState }
>('app/swapPersona', async (userId, { getState }) => {
  const persona = await StorageService.fetchUserPersona(userId);
  if (!persona) {
    return defaultPersona;
  }
  return persona;
});
