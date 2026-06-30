import { CanvasNodeType } from 'models/enums/nodeType';

export interface CanvasNode extends Record<string, unknown> {
  id: string;
  type: CanvasNodeType;
  data: any;
  capabilities: any;
}
