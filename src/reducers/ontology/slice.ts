import { createAppSlice } from '../createAppSlice';
import { GraphData, Neo4jNode } from 'models/interfaces/ontology';
import {
  generateOntology,
  fetchAllNodeLabels,
  fetchNodes,
  loadSubgraph,
  searchAndLoadNodes,
} from './actions';
import { FilterCondition } from '../../../shared/models/interfaces/filters';

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
  graphData: { nodes: [], relationships: [] },
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

/**
 * Helper function to merge new graph data into existing graph data
 * without duplicates
 */
const mergeGraphData = (
  existing: GraphData,
  incoming: GraphData,
): GraphData => {
  // Use Maps to deduplicate by ID
  const nodesMap = new Map<string, Neo4jNode>();
  const relationshipsMap = new Map<string, any>();

  // Add existing nodes and relationships
  existing.nodes.forEach((node) => nodesMap.set(node.id, node));
  existing.relationships.forEach((rel) => relationshipsMap.set(rel.id, rel));

  // Add incoming nodes and relationships (will overwrite if same ID)
  incoming.nodes.forEach((node) => nodesMap.set(node.id, node));
  incoming.relationships.forEach((rel) => relationshipsMap.set(rel.id, rel));

  return {
    nodes: Array.from(nodesMap.values()),
    relationships: Array.from(relationshipsMap.values()),
  };
};

export const OntologySlice = createAppSlice({
  name: 'ontology',
  initialState,
  reducers: (create) => ({
    clearGraphData: create.reducer((state) => {
      state.graphData = { nodes: [], relationships: [] };
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

        // Merge the fetched graph data (nodes and relationships)
        // state.graphData = mergeGraphData(state.graphData, payload.graphData);
        state.graphData = payload.graphData;

        // Clear highlighted node when filter changes
        state.controls.highlightedNodeId = null;
      })

      // Load subgraph
      .addCase(loadSubgraph.pending, (state) => {
        state.loading = { ...state.loading, loadingNodes: true };
      })
      .addCase(loadSubgraph.rejected, (state) => {
        state.loading = { ...state.loading, loadingNodes: false };
      })
      .addCase(loadSubgraph.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, loadingNodes: false };
        state.graphData = mergeGraphData(state.graphData, payload);
      })

      // Search and load nodes
      .addCase(searchAndLoadNodes.pending, (state) => {
        state.loading = { ...state.loading, searching: true };
      })
      .addCase(searchAndLoadNodes.rejected, (state) => {
        state.loading = { ...state.loading, searching: false };
      })
      .addCase(searchAndLoadNodes.fulfilled, (state, { payload }) => {
        state.loading = { ...state.loading, searching: false };
        state.graphData = payload;
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
