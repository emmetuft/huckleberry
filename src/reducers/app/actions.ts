import { createAsyncThunk } from '@reduxjs/toolkit';
import { Persona } from 'models/interfaces/persona';
import { StorageService } from 'services/storage';
import { IdentityService } from 'services/identity';

export const authenticate = createAsyncThunk<any, void>(
  'app/authenticate',
  IdentityService.authenticate,
);

export const fetchUserPersona = createAsyncThunk<Persona, void>(
  'app/fetchUserPersona',
  async () => {
    return StorageService.getUserPersona();
  },
);

export const saveUserPersona = createAsyncThunk<Persona, Persona>(
  'app/saveUserPersona',
  async (persona: Persona) => {
    return StorageService.saveUserPersona(persona);
  },
);
