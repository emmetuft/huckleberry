import { Column } from 'models/interfaces/column';
import { createAppSlice } from '../createAppSlice';

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
  reducers: () => ({}),
  extraReducers: (builder) => {},
  selectors: {
    selectMetricCatalogSchema: (state) => state.metricCatalogSchema,
  },
});

export const {
  /** incrementByAmount, incrementAsync */
} = MetricsSlice.actions;
export const { selectMetricCatalogSchema } = MetricsSlice.selectors;

export default MetricsSlice.reducer;
