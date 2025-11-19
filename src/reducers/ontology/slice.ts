import { createAppSlice } from '../createAppSlice';
import { GraphData } from 'models/interfaces/ontology';
import {
  generateOntology,
  fetchGraphFromNeo4j,
  fetchAllNodeLabels,
} from './actions';

interface State {
  graphData: GraphData;
  nodeLabels: string[];
  loading: {
    initGeneration: boolean;
    fetchNodeLabels: boolean;
    fetchGraph: boolean;
  };
}

const initialState: State = {
  graphData: { nodes: [], relationships: [] },
  nodeLabels: [],
  loading: {
    initGeneration: false,
    fetchNodeLabels: false,
    fetchGraph: false,
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
      // Generate ontology
      .addCase(generateOntology.pending, (state) => {
        state.loading = { ...state.loading, initGeneration: true };
      })
      .addCase(generateOntology.rejected, (state) => {
        state.loading = { ...state.loading, initGeneration: false };
      })
      .addCase(generateOntology.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, initGeneration: false };
        state.graphData = payload;
      })
      // Fetch graph from Neo4j
      .addCase(fetchGraphFromNeo4j.pending, (state) => {
        state.loading = { ...state.loading, fetchGraph: true };
      })
      .addCase(fetchGraphFromNeo4j.rejected, (state) => {
        state.loading = { ...state.loading, fetchGraph: false };
      })
      .addCase(fetchGraphFromNeo4j.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, fetchGraph: false };
        state.graphData = payload;
      })
      // Fetch all nodes
      .addCase(fetchAllNodeLabels.pending, (state) => {
        state.loading = { ...state.loading, fetchNodeLabels: true };
      })
      .addCase(fetchAllNodeLabels.rejected, (state) => {
        state.loading = { ...state.loading, fetchNodeLabels: false };
      })
      .addCase(fetchAllNodeLabels.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, fetchNodeLabels: false };
        state.nodeLabels = payload;
      });
  },
  selectors: {
    selectNodeLabels: (state: State) => state.nodeLabels,
    selectGraphData: (state: State) => state.graphData,
    selectLoading: (state: State) => state.loading,
  },
});

export const {
  /** incrementByAmount, incrementAsync */
} = OntologySlice.actions;
export const { selectNodeLabels, selectGraphData, selectLoading } =
  OntologySlice.selectors;

export default OntologySlice.reducer;
