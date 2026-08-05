export enum InsightType {
  UnstablePeak = 'unstable-peak',
  UncertainArea = 'uncertain-area',
  StaleKnowledge = 'stale-knowledge',
  StrongFoundation = 'strong-foundation',
}

export enum InsightSeverity {
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
}

export interface TopoInsight {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  affectedCount: number;
  affectedNodeLabels: string[];
  action?: string;
}
