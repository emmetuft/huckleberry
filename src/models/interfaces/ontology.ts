import { GraphDataType } from 'models/enums/graphDataType';
import { Column } from './column';

// SECTION: Graph Models

export interface GraphNodeModel {
  id: string;
  label: string;
  properties: GraphProperty[];
  position?: { x: number; y: number };
}

export interface GraphRelationshipModel {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  properties: GraphProperty[];
}

export type GraphEditorModel = GraphNodeModel | GraphRelationshipModel;

export const isRelationshipModel = (
  model: GraphEditorModel,
): model is GraphRelationshipModel => 'fromNodeId' in model;

export interface GraphProperty {
  name: string;
  type: GraphDataType;
}

export interface GraphModelData {
  nodes: GraphNodeModel[];
  edges: GraphRelationshipModel[];
}

// SECTION: Graph Data

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
