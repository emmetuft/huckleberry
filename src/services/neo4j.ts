import { GraphData, Neo4jNode } from 'models/interfaces/ontology';

const NEO4J_API_BASE = '/api/ontology';

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
 * Fetch all nodes from Neo4j
 */
const fetchNodes = async (): Promise<Neo4jNode[]> => {
  try {
    const response = await fetch(`${NEO4J_API_BASE}/nodes`);

    if (!response.ok) {
      throw new Error('Failed to fetch nodes from Neo4j');
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
  fetchGraph,
  fetchNodes,
  createNode,
  executeQuery,
};
