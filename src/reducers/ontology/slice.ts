import { createAppSlice } from '../createAppSlice';
import { fetchAllNodeLabels, fetchNodes } from './actions';
import { FilterCondition } from 'models/interfaces/graphFilter';
import { GraphData } from 'models/interfaces/ontology';

interface State {
  graphData: GraphData;
  nodeLabels: string[];
  loading: {
    initGeneration: boolean;
    fetchNodeLabels: boolean;
    fetchGraph: boolean;
    loadingNodes: boolean; // Generic loading for incremental operations
    searching: boolean;
  };
  controls: {
    highlightedNodeId: string | null;
    selectedLabels: string[];
    propertyFilters: FilterCondition[];
  };
}

const initialState: State = {
  graphData: { nodes: [], edges: [] },
  nodeLabels: [],
  loading: {
    initGeneration: false,
    fetchNodeLabels: false,
    fetchGraph: false,
    loadingNodes: false,
    searching: false,
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
    clearGraphData: create.reducer((state) => {
      state.graphData = { nodes: [], edges: [] };
      state.controls = {
        highlightedNodeId: null,
        selectedLabels: [],
        propertyFilters: [],
      };
    }),
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
      // Fetch node labels
      .addCase(fetchAllNodeLabels.pending, (state) => {
        state.loading = { ...state.loading, fetchNodeLabels: true };
      })
      .addCase(fetchAllNodeLabels.rejected, (state) => {
        state.loading = { ...state.loading, fetchNodeLabels: false };
      })
      .addCase(fetchAllNodeLabels.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, fetchNodeLabels: false };
        state.nodeLabels = payload;
      })

      // Fetch nodes
      .addCase(fetchNodes.pending, (state, { meta }) => {
        state.loading = { ...state.loading, loadingNodes: true };
        state.controls.selectedLabels =
          meta.arg.labels ?? state.controls.selectedLabels;
        state.controls.propertyFilters =
          meta.arg.filters ?? state.controls.propertyFilters;
      })
      .addCase(fetchNodes.rejected, (state) => {
        state.loading = { ...state.loading, loadingNodes: false };
      })
      .addCase(fetchNodes.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, loadingNodes: false };
        state.graphData = payload.graphData;
        // Clear highlighted node when filter changes
        state.controls.highlightedNodeId = null;
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
  clearGraphData,
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
