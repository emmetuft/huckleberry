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
  reducers: (create) => ({}),
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetricCatalogSchema.pending, (state) => {
        state.loading.fetchingSchema = true;
      })
      .addCase(fetchMetricCatalogSchema.rejected, (state) => {
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
