import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import {
  GraphData,
  Neo4jNode,
  OntologySource,
} from 'models/interfaces/ontology';
import { DomoAIService } from 'services/ai';
import { Neo4jService } from 'services/neo4j';
import { FilterCondition } from '../../../shared/models/interfaces/filters';

export const generateOntology = createAsyncThunk<GraphData, OntologySource[]>(
  'ontology/generateOntology',
  DomoAIService.generateOntology,
);

/**
 * Fetch all nodes from Neo4j
 */
export const fetchAllNodeLabels = createAsyncThunk<string[]>(
  'ontology/fetchAllNodeLabels',
  Neo4jService.fetchNodeLabels,
);

/**
 * Fetch nodes
 */
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
        graphData: { nodes: [], relationships: [] },
        labels: [],
      };
    }

    // Always fetch with all selected labels to get cross-label relationships
    // This ensures we get relationships between previously fetched and newly fetched nodes
    const result = await Neo4jService.fetchNodes({
      labels,
      filters,
      limit,
      includeRelationships: true,
    });

    // If the result is a GraphData structure (with nodes and relationships)
    if (result.nodes && result.relationships) {
      return { graphData: result, labels };
    }

    // Fallback: if we only got nodes, return empty relationships
    return {
      graphData: {
        nodes: Array.isArray(result) ? result : [],
        relationships: [],
      },
      labels,
    };
  },
);

/**
 * Load neighbors of a specific node and merge into graph
 */
export const loadNeighbors = createAsyncThunk<
  GraphData,
  { nodeId: string; limit?: number }
>('ontology/loadNeighbors', async ({ nodeId, limit }) => {
  return await Neo4jService.fetchNeighbors(nodeId, limit);
});

/**
 * Load a subgraph starting from a specific node and merge into graph
 */
export const loadSubgraph = createAsyncThunk<
  GraphData,
  { nodeId: string; depth?: number; limit?: number }
>('ontology/loadSubgraph', async ({ nodeId, depth, limit }) => {
  return await Neo4jService.fetchSubgraph(nodeId, depth, limit);
});

/**
 * Search for nodes and optionally load their subgraphs
 */
export const searchAndLoadNodes = createAsyncThunk<
  GraphData,
  { query: string; limit?: number; loadSubgraphs?: boolean }
>(
  'ontology/searchAndLoadNodes',
  async ({ query, limit, loadSubgraphs = false }) => {
    const { nodes, relationships } = await Neo4jService.searchNodes(
      query,
      limit,
    );

    if (loadSubgraphs && nodes.length > 0) {
      // Load subgraphs for all search results
      const subgraphPromises = nodes.map((node) =>
        Neo4jService.fetchSubgraph(node.id, 1, 100),
      );
      const subgraphs = await Promise.all(subgraphPromises);

      // Merge all subgraphs
      const nodeMap = new Map<string, Neo4jNode>();
      const relationships: any[] = [];

      subgraphs.forEach((subgraph) => {
        subgraph.nodes.forEach((node) => {
          if (!nodeMap.has(node.id)) {
            nodeMap.set(node.id, node);
          }
        });
        relationships.push(...subgraph.relationships);
      });

      // Deduplicate relationships
      const uniqueRels = Array.from(
        new Map(relationships.map((r) => [r.id, r])).values(),
      );

      return {
        nodes: Array.from(nodes.values()),
        relationships: uniqueRels,
      };
    }

    return { nodes, relationships };
  },
);

/**
 * Load shortest path between two nodes
 */
export const loadShortestPath = createAsyncThunk<
  GraphData,
  { fromId: string; toId: string }
>('ontology/loadShortestPath', async ({ fromId, toId }) => {
  return await Neo4jService.fetchShortestPath(fromId, toId);
});
