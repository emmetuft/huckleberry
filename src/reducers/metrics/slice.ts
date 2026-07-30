import { createAppSlice } from '../createAppSlice';
import { fetchMetrics, updateMetric } from './actions';
import { Metric } from 'models/interfaces/metric';

interface State {
  metrics: Metric[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  metrics: [],
  loading: false,
  error: null,
};

export const MetricsSlice = createAppSlice({
  name: 'metrics',
  initialState,
  reducers: () => ({}),
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load metrics';
      })
      .addCase(updateMetric.fulfilled, (state, action) => {
        const idx = state.metrics.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.metrics[idx] = action.payload;
      });
  },
  selectors: {
    selectMetrics: (state) => state.metrics,
    selectMetricsLoading: (state) => state.loading,
    selectMetricsError: (state) => state.error,
  },
});

export const { selectMetrics, selectMetricsLoading, selectMetricsError } =
  MetricsSlice.selectors;

export default MetricsSlice.reducer;
