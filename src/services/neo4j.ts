import { VALUE_QUERY_LIMIT } from 'constants/service';
import { GraphData } from 'models/interfaces/ontology';

const NEO4J_API_BASE = '/api/ontology';

interface HandleRequestParams {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

const handleRequest = async (params: HandleRequestParams) => {
  const { url, method = 'GET', headers = {}, body } = params;
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
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
 * Fetch unique property values for a given node label and property
 */
const fetchPropertyValues = async (
  label: string,
  property: string,
  limit: number = VALUE_QUERY_LIMIT,
): Promise<any[]> => {
  try {
    const data = await handleRequest({
      url: `${NEO4J_API_BASE}/property-values/${encodeURIComponent(label)}/${encodeURIComponent(property)}?limit=${limit}`,
    });
    return data.map((item: any) => item.value);
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
    return handleRequest({
      url: `${NEO4J_API_BASE}/nodes`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        labels,
        limit,
        includeRelationships,
        filters,
      },
    });
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

export const Neo4jService = {
  fetchNodeLabels,
  fetchPropertyValues,
  fetchNodes,
  fetchSubgraph,
  searchNodes,
};
