import { Column } from './column';

export interface Neo4jNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}
export interface Neo4jRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
}

export interface OntologySource {
  dataSourceId: string;
  name: string;
  schema: Column[];
  sampleRows: Record<string, any>[];
  error?: string;
}
