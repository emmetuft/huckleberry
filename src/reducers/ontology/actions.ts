import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppThunk, RootState } from 'reducers';
import { selectGraphModelData, setGraphModelData } from './slice';
import { FilterCondition, NodeFilter } from 'models/interfaces/graphFilter';
import {
  GraphData,
  GraphNodeModel,
  GraphRelationshipModel,
} from 'models/interfaces/ontology';
import { GraphService } from 'services/graph';
import { parseFilterConditions } from 'utils/ontology';

export const fetchAllNodeLabels = createAsyncThunk<string[]>(
  'ontology/fetchAllNodeLabels',
  GraphService.fetchNodeLabels,
);

export const fetchNodes = createAsyncThunk<
  { graphData: GraphData; labels: string[] },
  { labels?: string[]; filters?: FilterCondition[]; limit?: number },
  { state: RootState }
>(
  'ontology/fetchNodes',
  async ({ labels: selectedLabels, filters, limit }, { getState }) => {
    const { controls } = getState().ontology;
    let labels = selectedLabels ?? controls.selectedLabels;
    if (labels.length === 0) {
      return {
        graphData: { nodes: [], edges: [] },
        labels: [],
      };
    }

    const filter: NodeFilter = {
      nodeLabels: labels,
      labelMode: 'ANY',
      propertyFilters: parseFilterConditions(
        filters ?? controls.propertyFilters,
      ),
    };

    const result = await GraphService.fetchNodes({
      filter,
      limit,
    });

    // If the result is a GraphData structure (with nodes and edges)
    // if (result.nodes && result.edges) {
    //   return { graphData: result, labels };
    // }

    // Fallback: if we only got nodes, return empty edges
    return {
      graphData: {
        nodes: Array.isArray(result) ? result : [],
        edges: [],
      },
      labels,
    };
  },
);

export const upsertModelNode =
  (node: GraphNodeModel): AppThunk =>
  (dispatch, getState) => {
    const data = selectGraphModelData(getState());
    const nodes = data.nodes.some((n) => n.id === node.id)
      ? data.nodes.map((n) => (n.id === node.id ? node : n))
      : [...data.nodes, node];
    dispatch(setGraphModelData({ ...data, nodes }));
  };

export const deleteModelNode =
  (nodeId: string): AppThunk =>
  (dispatch, getState) => {
    const data = selectGraphModelData(getState());
    dispatch(
      setGraphModelData({
        nodes: data.nodes.filter((n) => n.id !== nodeId),
        edges: data.edges.filter(
          (e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId,
        ),
      }),
    );
  };

export const upsertModelRelationship =
  (rel: GraphRelationshipModel): AppThunk =>
  (dispatch, getState) => {
    const data = selectGraphModelData(getState());
    const edges = data.edges.some((e) => e.id === rel.id)
      ? data.edges.map((e) => (e.id === rel.id ? rel : e))
      : [...data.edges, rel];
    dispatch(setGraphModelData({ ...data, edges }));
  };

export const deleteModelRelationship =
  (relId: string): AppThunk =>
  (dispatch, getState) => {
    const data = selectGraphModelData(getState());
    if (!data.edges.some((e) => e.id === relId)) return;
    dispatch(
      setGraphModelData({
        ...data,
        edges: data.edges.filter((e) => e.id !== relId),
      }),
    );
  };
