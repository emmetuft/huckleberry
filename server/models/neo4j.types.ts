/**
 * Shared types for Neo4j data structures
 * These can be imported by both frontend and backend
 */

export interface Neo4jNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface Neo4jRelationship {
  id: string;
  type: string;
  source: string;
  target: string;
  properties: Record<string, any>;
}

export interface Neo4jGraph {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}
