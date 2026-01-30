import { Identity } from '@domoinc/toolkit';
import { createAppSlice } from '../createAppSlice';
import {
  authenticate,
  fetchIdentity,
  fetchUserPersona,
  saveUserPersona,
} from './actions';
import { AppPage } from 'models/enums/appPage';
import { Persona } from '../../../shared/models/interfaces/persona';

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
  }),
  extraReducers: (builder) => {
    builder
      // Fetch identity
      .addCase(fetchIdentity.pending, (state) => {
        state.loading.identity = true;
      })
      .addCase(fetchIdentity.rejected, (state) => {
        state.loading.identity = false;
      })
      .addCase(fetchIdentity.fulfilled, (state, { payload }) => {
        state.identity = payload;
        state.loading.identity = false;
      })
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
      })
      // Save user persona
      .addCase(saveUserPersona.pending, (state) => {
        state.loading.personaUpdate = true;
      })
      .addCase(saveUserPersona.rejected, (state) => {
        state.loading.personaUpdate = false;
      })
      .addCase(saveUserPersona.fulfilled, (state, { payload }) => {
        state.persona = payload;
        state.loading.personaUpdate = false;
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

export { authenticate, fetchIdentity, fetchUserPersona, saveUserPersona };
export const { setPage, setIncognitoMode, setPersonaModal } =
  AppReducer.actions;
export const {
  selectIdentity,
  selectPersona,
  selectPage,
  selectIncognitoMode,
  selectPersonaModalOpen,
  selectLoading,
} = AppReducer.selectors;

export default AppReducer.reducer;
