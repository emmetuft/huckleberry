import { Identity } from '@domoinc/toolkit';
import { createAppSlice } from '../createAppSlice';
import { fetchUserPersona } from './actions';
import { Persona } from 'models/interfaces/persona';
import { AppService } from 'services/app';
import { StorageService } from 'services/storage';
import { AppPage } from 'models/enums/appPage';
import { AuthResponse } from '@appteam6/domoapps.js';

interface State {
  identity?: Identity;
  persona?: Persona;
  page: AppPage;
  incognitoMode: boolean;
  personaModalOpen: boolean;
  loading: {
    identity: boolean;
    persona: boolean;
    personaUpdate: boolean;
  };
}

const initialState: State = {
  page: AppPage.HOME,
  incognitoMode: false,
  personaModalOpen: false,
  loading: {
    identity: false,
    persona: false,
    personaUpdate: false,
  },
};

export const AppReducer = createAppSlice({
  name: 'app',
  initialState,
  reducers: (create) => ({
    setPage: create.reducer((state, { payload }: { payload: AppPage }) => {
      state.page = payload;
    }),
    setIncognitoMode: create.reducer(
      (state, { payload }: { payload: boolean }) => {
        state.incognitoMode = payload;
      },
    ),
    setPersonaModal: create.reducer(
      (state, { payload }: { payload: boolean }) => {
        state.personaModalOpen = payload;
      },
    ),
    authenticate: create.asyncThunk<AuthResponse, void>(
      AppService.authenticate,
    ),
    fetchIdentity: create.asyncThunk<Identity, void>(
      async () => {
        const identity = await AppService.fetchIdentity();
        return identity;
      },
      {
        fulfilled: (state: State, { payload }: { payload: Identity }) => {
          state.identity = payload;
          state.loading.identity = false;
        },
        pending: (state: State) => {
          state.loading.identity = true;
        },
        rejected: (state: State) => {
          state.loading.identity = false;
        },
      },
    ),
    saveUserPersona: create.asyncThunk<Persona, Persona>(
      async (persona: Persona) => {
        const updatedPersona = await StorageService.saveUserPersona(persona);
        return updatedPersona;
      },
      {
        fulfilled: (state: State, { payload }: { payload: Persona }) => {
          state.persona = payload;
          state.loading.personaUpdate = false;
        },
        pending: (state: State) => {
          state.loading.personaUpdate = true;
        },
        rejected: (state: State) => {
          state.loading.personaUpdate = false;
        },
      },
    ),
  }),
  extraReducers: (builder) => {
    builder
      // Fetch user persona
      .addCase(fetchUserPersona.pending, (state) => {
        state.loading = { ...state.loading, persona: true };
      })
      .addCase(fetchUserPersona.rejected, (state) => {
        state.loading = { ...state.loading, persona: false };
      })
      .addCase(fetchUserPersona.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, persona: false };
        state.persona = payload;
      });
  },
  selectors: {
    selectIdentity: (state) => state.identity,
    selectPersona: (state) => state.persona,
    selectPage: (state) => state.page,
    selectIncognitoMode: (state) => state.incognitoMode,
    selectPersonaModalOpen: (state) => state.personaModalOpen,
    selectLoading: (state) => state.loading,
  },
});

export const {
  authenticate,
  fetchIdentity,
  saveUserPersona,
  setPage,
  setIncognitoMode,
  setPersonaModal,
} = AppReducer.actions;
export const {
  selectIdentity,
  selectPersona,
  selectPage,
  selectIncognitoMode,
  selectPersonaModalOpen,
  selectLoading,
} = AppReducer.selectors;

export default AppReducer.reducer;
