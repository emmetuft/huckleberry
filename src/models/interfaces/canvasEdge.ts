import { CanvasEdgeType } from 'models/enums/edgeType';

export interface CanvasEdgeData extends Record<string, unknown> {
  relationship: CanvasEdgeType;
}
