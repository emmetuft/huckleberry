import { SimulationNodeDatum } from 'd3';
import { Column } from './column';

export interface GraphData {
  nodes: NodeType[];
  links: {
    source: string;
    target: string;
    type: string;
    value: number;
  }[];
}

export interface NodeType extends SimulationNodeDatum {
  id: string;
  group: number;
}

export interface OntologySource {
  dataSourceId: string;
  name: string;
  schema: Column[];
  sampleRows: Record<string, any>[];
  error?: string;
}
