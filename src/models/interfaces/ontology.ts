import { GraphDataType } from 'models/enums/graphDataType';
import { Column } from './column';

export interface GraphNodeModel {
  id: string;
  label: string;
  properties: GraphProperty[];
}

export interface GraphProperty {
  name: string;
  type: GraphDataType;
}

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
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
