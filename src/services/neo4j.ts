import { GraphData } from 'models/interfaces/ontology';

const NEO4J_API_BASE = '/api/ontology';

/**
 * Fetch all node labels from Neo4j
 */
const fetchNodeLabels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${NEO4J_API_BASE}/labels`);

    if (!response.ok) {
      throw new Error('Failed to fetch node labels from Neo4j');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data.map((item: any) => item.label);
  } catch (error: any) {
    throw error;
  }
};

/**
 * Fetch the complete graph from Neo4j
 */
const fetchGraph = async (): Promise<GraphData> => {
  try {
    const response = await fetch(`${NEO4J_API_BASE}/graph`);

    if (!response.ok) {
      throw new Error('Failed to fetch graph from Neo4j');
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

export const Neo4jService = {
  fetchNodeLabels,
  fetchGraph,
  createNode,
  executeQuery,
};
