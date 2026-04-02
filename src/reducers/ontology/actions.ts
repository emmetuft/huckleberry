import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { FilterCondition, NodeFilter } from 'models/interfaces/graphFilter';
import { GraphData } from 'models/interfaces/ontology';
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
