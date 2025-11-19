import { createAppSlice } from '../createAppSlice';
import { GraphData } from 'models/interfaces/ontology';
import {
  generateOntology,
  fetchGraphFromNeo4j,
  fetchAllNodeLabels,
} from './actions';
import { FilterCondition } from 'models/enums/filters';

interface State {
  graphData: GraphData;
  nodeLabels: string[];
  loading: {
    initGeneration: boolean;
    fetchNodeLabels: boolean;
    fetchGraph: boolean;
  };
  controls: {
    highlightedNodeId: string | null;
    selectedLabels: string[];
    propertyFilters: FilterCondition[];
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
  controls: {
    highlightedNodeId: null,
    selectedLabels: [],
    propertyFilters: [],
  },
};

export const OntologySlice = createAppSlice({
  name: 'ontology',
  initialState,
  reducers: (create) => ({
    setHighlightedNode: create.reducer<string | null>((state, { payload }) => {
      state.controls.highlightedNodeId = payload;
    }),
    clearHighlightedNode: create.reducer((state) => {
      state.controls.highlightedNodeId = null;
    }),
    setLabelFilters: create.reducer<string[]>((state, { payload }) => {
      state.controls.selectedLabels = payload;
      // Clear highlighted node when filter changes to prevent issues with filtered-out nodes
      state.controls.highlightedNodeId = null;
    }),
    setPropertyFilters: create.reducer<FilterCondition[]>(
      (state, { payload }) => {
        state.controls.propertyFilters = payload;
      },
    ),
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
    selectHighlightedNodeId: (state: State) => state.controls.highlightedNodeId,
    selectLabelFilters: (state: State) => state.controls.selectedLabels,
    selectPropertyFilters: (state: State) => state.controls.propertyFilters,
  },
});

export const {
  setHighlightedNode,
  clearHighlightedNode,
  setLabelFilters,
  setPropertyFilters,
} = OntologySlice.actions;

export const {
  selectNodeLabels,
  selectGraphData,
  selectLoading,
  selectHighlightedNodeId,
  selectLabelFilters,
  selectPropertyFilters,
} = OntologySlice.selectors;

export default OntologySlice.reducer;
