import { Column } from './column';

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface OntologySource {
  dataSourceId: string;
  name: string;
  schema: Column[];
  sampleRows: Record<string, any>[];
  error?: string;
}
