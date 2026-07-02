export enum CanvasEdgeType {
  DependsOn = 'depends_on',
  Blocks = 'blocks',
  ReportsTo = 'reports_to',
  Causes = 'causes',
  Increases = 'increases',
  Reduces = 'reduces',
  OwnedBy = 'owned_by',
  Requests = 'requests',
  Supports = 'supports',
}

export const EDGE_TYPE_LABELS: Record<CanvasEdgeType, string> = {
  [CanvasEdgeType.DependsOn]: 'depends on',
  [CanvasEdgeType.Blocks]: 'blocks',
  [CanvasEdgeType.ReportsTo]: 'reports to',
  [CanvasEdgeType.Causes]: 'causes',
  [CanvasEdgeType.Increases]: 'increases',
  [CanvasEdgeType.Reduces]: 'reduces',
  [CanvasEdgeType.OwnedBy]: 'owned by',
  [CanvasEdgeType.Requests]: 'requests',
  [CanvasEdgeType.Supports]: 'supports',
};
