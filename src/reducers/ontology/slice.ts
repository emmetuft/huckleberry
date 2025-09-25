import { createAppSlice } from '../createAppSlice';
import { GraphData } from 'models/interfaces/ontology';
import { generateOntology } from './actions';

interface State {
  graphData: GraphData;
  loading: {
    initGeneration: boolean;
  };
}

const initialState: State = {
  graphData: { nodes: [], links: [] },
  loading: {
    initGeneration: false,
  },
};

export const OntologySlice = createAppSlice({
  name: 'ontology',
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
      // Fetch user persona
      .addCase(generateOntology.pending, (state) => {
        state.loading = { ...state.loading, initGeneration: true };
      })
      .addCase(generateOntology.rejected, (state) => {
        state.loading = { ...state.loading, initGeneration: false };
      })
      .addCase(generateOntology.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, initGeneration: false };
        state.graphData = payload;
      });
  },
  selectors: {
    selectGraphData: (state: State) => state.graphData,
    selectLoading: (state: State) => state.loading,
  },
});

export const {
  /** incrementByAmount, incrementAsync */
} = OntologySlice.actions;
export const { selectGraphData, selectLoading } = OntologySlice.selectors;

export default OntologySlice.reducer;
