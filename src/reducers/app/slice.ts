import { Identity } from '@domoinc/toolkit';
import { createAppSlice } from '../createAppSlice';
import { fetchUserPersona } from './actions';
import { Persona } from 'models/interfaces/persona';
import { AppService } from 'services/app';
import { StorageService } from 'services/storage';

interface State {
  identity?: Identity;
  persona?: Persona;
  personaModalOpen: boolean;
  loading: {
    identity: boolean;
    persona: boolean;
    personaUpdate: boolean;
  };
}

const initialState: State = {
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
    setPersonaModal: create.reducer(
      (state, { payload }: { payload: boolean }) => {
        state.personaModalOpen = payload;
      },
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
    selectPersonaModalOpen: (state) => state.personaModalOpen,
    selectLoading: (state) => state.loading,
  },
});

export const { fetchIdentity, saveUserPersona, setPersonaModal } =
  AppReducer.actions;
export const {
  selectIdentity,
  selectPersona,
  selectPersonaModalOpen,
  selectLoading,
} = AppReducer.selectors;

export default AppReducer.reducer;
