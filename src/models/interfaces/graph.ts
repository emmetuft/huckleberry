// Types mirroring Mako's Synapse API (/api/recall/v1)

export interface NodeIdentifier {
  primaryLabel: string;
  id: unknown;
}

export interface NodeResult {
  id: string;
  labels: string[];
  nodeId: NodeIdentifier;
  properties: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Cypher search

export interface CypherVisualizationNode {
  id: string;
  nodeIdentifier: NodeIdentifier;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface CypherVisualizationEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface CypherVisualizationGraph {
  nodes: CypherVisualizationNode[];
  edges: CypherVisualizationEdge[];
}

export interface CypherSearchRequest {
  cypherQuery: string;
  parameters?: Record<string, unknown>;
  limit?: number;
}

export interface CypherSearchResult {
  records: Record<string, unknown>[];
  executedQuery: string;
  executedParameters: Record<string, unknown>;
  totalCount: number;
  wasTruncated: boolean;
  executionTimeMs: number;
  graph: CypherVisualizationGraph | null;
}

// Graph schema

export interface SchemaNode {
  nodeType: string;
  properties: Record<string, string>;
}

export interface SchemaEdge {
  source: string;
  target: string;
  relationshipType: string;
}

export interface GraphSchema {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
  nodeProperties: Record<string, Record<string, string>>;
}

// Shortest path

export interface PathNode {
  nodeId: NodeIdentifier;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface PathEdge {
  startNode: NodeIdentifier;
  type: string;
  properties: Record<string, unknown>;
  endNode: NodeIdentifier;
}

export interface ShortestPathRequest {
  fromNode: NodeIdentifier;
  toNode: NodeIdentifier;
  relationshipTypes?: string[];
  maxDepth?: number;
}

export interface PathResult {
  nodes: PathNode[];
  relationships: PathEdge[];
  length: number;
}
