import { CanvasNodeType } from 'models/enums/nodeType';
import { KnowledgeMetrics } from './knowledgeMetrics';

export interface CanvasNodeHint {
  title?: string;
  description?: string;
}

export interface CanvasNode extends Record<string, unknown> {
  id: string;
  type: CanvasNodeType;
  data: any;
  capabilities: any;
  hint?: CanvasNodeHint;
  knowledgeMetrics?: KnowledgeMetrics;
}
