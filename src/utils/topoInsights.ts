import { Node } from '@xyflow/react';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { KnowledgeMetrics } from 'models/interfaces/knowledgeMetrics';
import {
  InsightSeverity,
  InsightType,
  TopoInsight,
} from 'models/interfaces/topoInsight';
import { NodeWithMetrics } from 'utils/knowledgeMetrics';

function getNodeLabel(node: Node<CanvasNode>): string {
  return (
    ((node.data?.data as Record<string, unknown>)?.title as
      | string
      | undefined) ?? node.id
  );
}

interface InsightRule {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: (count: number) => string;
  action?: string;
  test: (m: KnowledgeMetrics) => boolean;
}

const RULES: InsightRule[] = [
  {
    type: InsightType.UnstablePeak,
    severity: InsightSeverity.Warning,
    title: 'Unstable peaks',
    description: (n) =>
      `${n} node${n > 1 ? 's are' : ' is'} high-impact but underdeveloped — significant contribution with low maturity.`,
    action: 'Invest in fleshing these out',
    test: (m) => m.contribution > 0.6 && m.maturity < 0.4,
  },
  {
    type: InsightType.UncertainArea,
    severity: InsightSeverity.Warning,
    title: 'Uncertain areas',
    description: (n) =>
      `${n} key node${n > 1 ? 's have' : ' has'} low confidence — important assumptions remain unverified.`,
    action: 'Add supporting evidence',
    test: (m) => m.contribution > 0.5 && m.confidence < 0.4,
  },
  {
    type: InsightType.StaleKnowledge,
    severity: InsightSeverity.Info,
    title: 'Stale knowledge',
    description: (n) =>
      `${n} node${n > 1 ? 's have' : ' has'} not been updated recently and may be outdated.`,
    action: 'Review and refresh',
    test: (m) => m.freshness < 0.3,
  },
  {
    type: InsightType.StrongFoundation,
    severity: InsightSeverity.Success,
    title: 'Strong foundations',
    description: (n) =>
      `${n} well-developed node${n > 1 ? 's are' : ' is'} anchoring the terrain with high contribution and maturity.`,
    test: (m) => m.contribution > 0.7 && m.maturity > 0.7,
  },
];

const SEVERITY_PRIORITY: Record<InsightSeverity, number> = {
  [InsightSeverity.Warning]: 0,
  [InsightSeverity.Info]: 1,
  [InsightSeverity.Success]: 2,
};

export function computeTopoInsights(
  nodesWithMetrics: NodeWithMetrics[],
): TopoInsight[] {
  const insights: TopoInsight[] = [];

  for (const rule of RULES) {
    const matching = nodesWithMetrics.filter((nwm) => rule.test(nwm.metrics));
    if (matching.length === 0) continue;

    insights.push({
      type: rule.type,
      severity: rule.severity,
      title: rule.title,
      description: rule.description(matching.length),
      affectedCount: matching.length,
      affectedNodeLabels: matching
        .slice(0, 2)
        .map((nwm) => getNodeLabel(nwm.node)),
      action: rule.action,
    });
  }

  insights.sort((a, b) => {
    const pd = SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity];
    if (pd !== 0) return pd;
    return b.affectedCount - a.affectedCount;
  });

  return insights;
}
