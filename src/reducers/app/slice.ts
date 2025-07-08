import { createAppSlice } from '../createAppSlice';

interface State {
  value: number;
}

const initialState: State = {
  value: 0,
};

export const AppReducer = createAppSlice({
  name: 'app',
  initialState,
  reducers: (create) => ({
    // increments the counter by one
    increment: create.reducer((state) => {
      state.value += 1;
    }),

    // decrements the counter by one
    decrement: create.reducer((state) => {
      state.value -= 1;
    }),

    // increments the counter by the given amount
    incrementByAmount: create.reducer<number>((state, { payload }) => {
      state.value += payload;
    }),

    // increments the counter by the given amount, asynchronously
    incrementAsync: create.asyncThunk<number, number>(
      async (amount: number) =>
        await new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(amount);
          }, 1000);
        }),
      {
        fulfilled: (state, { payload }) => {
          state.value += payload;
        },
      },
    ),
  }),
  selectors: {
    selectValue: (state) => state.value,
  },
});

export const { increment, decrement, incrementByAmount, incrementAsync } =
  AppReducer.actions;
export const { selectValue } = AppReducer.selectors;

export default AppReducer.reducer;
