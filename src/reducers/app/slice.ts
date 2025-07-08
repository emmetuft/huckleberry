import { Identity } from '@domoinc/toolkit';
import { createAppSlice } from '../createAppSlice';
import { AppService } from 'services/app';

interface State {
  identity?: Identity;
  loading: {
    identity: boolean;
  };
}

const initialState: State = {
  loading: {
    identity: false,
  },
};

export const AppReducer = createAppSlice({
  name: 'app',
  initialState,
  reducers: (create) => ({
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
  }),
  selectors: {
    selectIdentity: (state) => state.identity,
  },
});

export const { fetchIdentity } = AppReducer.actions;
export const { selectIdentity } = AppReducer.selectors;

export default AppReducer.reducer;
