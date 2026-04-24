import { createAppSlice } from '../createAppSlice';
import { fetchAllNodeLabels, fetchNodes } from './actions';
import { FilterCondition } from 'models/interfaces/graphFilter';
import {
  GraphData,
  GraphEditorModel,
  GraphModelData,
  GraphNodeModel,
  GraphRelationshipModel,
  isRelationshipModel,
} from 'models/interfaces/ontology';
import { INITIAL_GRAPH_MODEL_DATA } from 'constants/ontologyModels';
import { PEOPLE_SKILLS_GRAPH } from 'constants/graph';

interface State {
  graphModelData: GraphModelData;
  graphData: GraphData;
  nodeLabels: string[];
  loading: {
    initGeneration: boolean;
    fetchNodeLabels: boolean;
    fetchGraph: boolean;
    loadingNodes: boolean;
    searching: boolean;
  };
  controls: {
    highlightedNodeId: string | null;
    selectedLabels: string[];
    propertyFilters: FilterCondition[];
  };
}

const initialState: State = {
  graphModelData: INITIAL_GRAPH_MODEL_DATA,
  graphData: PEOPLE_SKILLS_GRAPH,
  nodeLabels: INITIAL_GRAPH_MODEL_DATA.nodes.flatMap((n) => n.label),
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
    upsertModelNode: create.reducer<GraphNodeModel>((state, { payload }) => {
      const idx = state.graphModelData.nodes.findIndex(
        (n) => n.id === payload.id,
      );
      if (idx >= 0) state.graphModelData.nodes[idx] = payload;
      else state.graphModelData.nodes.push(payload);
    }),
    deleteModelNode: create.reducer<string>((state, { payload: nodeId }) => {
      state.graphModelData.nodes = state.graphModelData.nodes.filter(
        (n) => n.id !== nodeId,
      );
      state.graphModelData.edges = state.graphModelData.edges.filter(
        (e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId,
      );
    }),
    upsertModelRelationship: create.reducer<GraphRelationshipModel>(
      (state, { payload }) => {
        const idx = state.graphModelData.edges.findIndex(
          (e) => e.id === payload.id,
        );
        if (idx >= 0) state.graphModelData.edges[idx] = payload;
        else state.graphModelData.edges.push(payload);
      },
    ),
    deleteModelRelationship: create.reducer<string>(
      (state, { payload: relId }) => {
        state.graphModelData.edges = state.graphModelData.edges.filter(
          (e) => e.id !== relId,
        );
      },
    ),
    updateGraphEditorModel: create.reducer<GraphEditorModel>(
      (state, { payload }) => {
        if (isRelationshipModel(payload)) {
          const idx = state.graphModelData.edges.findIndex(
            (e) => e.id === payload.id,
          );
          if (idx >= 0) state.graphModelData.edges[idx] = payload;
        } else {
          const idx = state.graphModelData.nodes.findIndex(
            (n) => n.id === payload.id,
          );
          if (idx >= 0) state.graphModelData.nodes[idx] = payload;
        }
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
    selectGraphModelData: (state: State) => state.graphModelData,
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
  upsertModelNode,
  deleteModelNode,
  upsertModelRelationship,
  deleteModelRelationship,
  updateGraphEditorModel,
} = OntologySlice.actions;

export const {
  selectNodeLabels,
  selectGraphData,
  selectGraphModelData,
  selectLoading,
  selectHighlightedNodeId,
  selectLabelFilters,
  selectPropertyFilters,
} = OntologySlice.selectors;

export default OntologySlice.reducer;
