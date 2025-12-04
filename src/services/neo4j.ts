import { GraphData } from 'models/interfaces/ontology';

const NEO4J_API_BASE = '/api/ontology';

interface HandleRequestParams {
  url: string;
}

const handleRequest = async (params: HandleRequestParams) => {
  const response = await fetch(params.url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch from Neo4j: ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }

  return result.data;
};

/**
 * Fetch all node labels from Neo4j
 */
const fetchNodeLabels = async (): Promise<string[]> => {
  try {
    const data = await handleRequest({ url: `${NEO4J_API_BASE}/labels` });
    return data.map((item: any) => item.label);
  } catch (error: any) {
    throw error;
  }
};

/**
 * Fetch nodes with optional filters
 */
interface FetchNodesParams {
  labels?: string[];
  filters?: any[];
  limit?: number;
  includeRelationships?: boolean;
}

const fetchNodes = async ({
  labels,
  filters,
  limit,
  includeRelationships,
}: FetchNodesParams): Promise<GraphData> => {
  try {
    const response = await fetch(`${NEO4J_API_BASE}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        labels,
        limit,
        includeRelationships,
        filters,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from Neo4j: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Fetch a subgraph starting from a specific node
 */
const fetchSubgraph = async (
  nodeId: string,
  depth: number = 2,
  limit: number = 500,
): Promise<GraphData> => {
  try {
    return handleRequest({
      url: `${NEO4J_API_BASE}/subgraph/${nodeId}?depth=${depth}&limit=${limit}`,
    });
  } catch (error: any) {
    throw error;
  }
};

/**
 * Fetch neighbors of a specific node
 */
const fetchNeighbors = async (
  nodeId: string,
  limit: number = 200,
): Promise<GraphData> => {
  try {
    return handleRequest({
      url: `${NEO4J_API_BASE}/node/${nodeId}/neighbors?limit=${limit}`,
    });
  } catch (error: any) {
    throw error;
  }
};

/**
 * Find shortest path between two nodes
 */
const fetchShortestPath = async (
  fromId: string,
  toId: string,
): Promise<GraphData> => {
  try {
    return handleRequest({
      url: `${NEO4J_API_BASE}/path?from=${fromId}&to=${toId}`,
    });
  } catch (error: any) {
    throw error;
  }
};

/**
 * Search for nodes using full-text search
 */
const searchNodes = async (
  query: string,
  limit: number = 100,
): Promise<GraphData> => {
  try {
    return handleRequest({
      url: `${NEO4J_API_BASE}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    });
  } catch (error: any) {
    throw error;
  }
};

/**
 * Execute a custom Cypher query
 */
const executeQuery = async (cypher: string, params?: Record<string, any>) => {
  try {
    const response = await fetch(`${NEO4J_API_BASE}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cypher, params }),
    });

    if (!response.ok) {
      throw new Error('Failed to execute query');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Create a new node in Neo4j
 */
const createNode = async (label: string, properties: Record<string, any>) => {
  try {
    const response = await fetch(`${NEO4J_API_BASE}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label, properties }),
    });

    if (!response.ok) {
      throw new Error('Failed to create node in Neo4j');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data;
  } catch (error: any) {
    throw error;
  }
};

export const Neo4jService = {
  fetchNodeLabels,
  fetchNodes,
  fetchSubgraph,
  fetchNeighbors,
  fetchShortestPath,
  searchNodes,
  executeQuery,
  createNode,
};
