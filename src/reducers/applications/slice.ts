import { createAppSlice } from '../createAppSlice';

interface State {
  tab: 'Apps' | 'Marketplace';
}

const initialState: State = {
  tab: 'Apps',
};

export const ApplicationsSlice = createAppSlice({
  name: 'applications',
  initialState,
  reducers: (create) => ({
    setTab: create.reducer<'Apps' | 'Marketplace'>((state, { payload }) => {
      state.tab = payload;
    }),
  }),
  selectors: {
    selectTab: (state) => state.tab,
  },
});

export const { setTab } = ApplicationsSlice.actions;
export const { selectTab } = ApplicationsSlice.selectors;

export default ApplicationsSlice.reducer;
