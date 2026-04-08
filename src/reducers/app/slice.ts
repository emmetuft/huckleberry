import { Identity } from 'models/interfaces/identity';
import { createAppSlice } from '../createAppSlice';
import { authenticate, fetchUserPersona, saveUserPersona } from './actions';
import { AppPage } from 'models/enums/appPage';
import { Persona } from 'models/interfaces/persona';
import { defaultPersona } from 'constants/persona';

interface State {
  identity?: Identity;
  persona: Persona;
  page: AppPage;
  theme: 'light' | 'dark';
  incognitoMode: boolean;
  personaModalOpen: boolean;
  isNewUser: boolean;
  onboardingCompleted: boolean;
  loading: {
    identity: boolean;
    persona: boolean;
    personaUpdate: boolean;
  };
}

const initialState: State = {
  persona: defaultPersona,
  page: AppPage.HOME,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  incognitoMode: false,
  personaModalOpen: false,
  isNewUser: true, // TODO: derive from user identity / API
  onboardingCompleted: false,
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
    setTheme: create.reducer(
      (state, { payload }: { payload: 'light' | 'dark' }) => {
        state.theme = payload;
        localStorage.setItem('theme', payload);
      },
    ),
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
    setOnboardingCompleted: create.reducer(
      (state, { payload }: { payload: boolean }) => {
        state.onboardingCompleted = payload;
      },
    ),
  }),
  extraReducers: (builder) => {
    builder
      // Fetch identity
      .addCase(authenticate.pending, (state) => {
        state.loading.identity = true;
      })
      .addCase(authenticate.rejected, (state) => {
        state.loading.identity = false;
      })
      .addCase(authenticate.fulfilled, (state, { payload }) => {
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
        if (payload) state.persona = payload;
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
    selectTheme: (state) => state.theme,
    selectIncognitoMode: (state) => state.incognitoMode,
    selectPersonaModalOpen: (state) => state.personaModalOpen,
    selectIsNewUser: (state) => state.isNewUser,
    selectOnboardingCompleted: (state) => state.onboardingCompleted,
    selectLoading: (state) => state.loading,
  },
});

export const {
  setPage,
  setTheme,
  setIncognitoMode,
  setPersonaModal,
  setOnboardingCompleted,
} = AppReducer.actions;
export const {
  selectIdentity,
  selectPersona,
  selectPage,
  selectTheme,
  selectIncognitoMode,
  selectPersonaModalOpen,
  selectIsNewUser,
  selectOnboardingCompleted,
  selectLoading,
} = AppReducer.selectors;

export default AppReducer.reducer;
