import { Column } from 'models/interfaces/column';
import { createAppSlice } from '../createAppSlice';
import { fetchMetricCatalogSchema } from './actions';

interface State {
  metricCatalogSchema: Column[];
  loading: {
    fetchingSchema: boolean;
  };
}

const initialState: State = {
  metricCatalogSchema: [],
  loading: {
    fetchingSchema: false,
  },
};

export const MetricsSlice = createAppSlice({
  name: 'metrics',
  initialState,
  reducers: (create) => ({
    // // e.g. increments "value" by the given amount
    // incrementByAmount: create.reducer<number>((state, { payload }) => {
    //   state.value += payload;
    // }),
    //
    // // e.g. increments "value" by the given amount, asynchronously
    // incrementAsync: create.asyncThunk<number, number>(
    //   async (amount: number) =>
    //     await new Promise<number>((resolve) => {
    //       setTimeout(() => {
    //         resolve(amount);
    //       }, 1000);
    //     }),
    //   {
    //     fulfilled: (state, { payload }) => {
    //       state.value += payload;
    //     },
    //   },
    // ),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetricCatalogSchema.pending, (state, action) => {
        state.loading.fetchingSchema = true;
      })
      .addCase(fetchMetricCatalogSchema.rejected, (state, action) => {
        state.loading.fetchingSchema = false;
      })
      .addCase(fetchMetricCatalogSchema.fulfilled, (state, { payload }) => {
        state.loading.fetchingSchema = false;
        state.metricCatalogSchema = payload;
      });
  },
  selectors: {
    selectMetricCatalogSchema: (state) => state.metricCatalogSchema,
  },
});

export const {
  /** incrementByAmount, incrementAsync */
} = MetricsSlice.actions;
export const { selectMetricCatalogSchema } = MetricsSlice.selectors;

export default MetricsSlice.reducer;
