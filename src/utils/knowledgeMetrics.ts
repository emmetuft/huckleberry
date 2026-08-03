import { Edge, Node } from '@xyflow/react';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { CanvasNodeType } from 'models/enums/nodeType';
import { KnowledgeMetrics } from 'models/interfaces/knowledgeMetrics';
import { AIAnalysisNodeStatus } from 'pages/platform/Workspace/WorkspaceCanvas/Nodes/AIAnalysisNode';

const FRESHNESS_DECAY_DAYS = 180;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function edgeDegree(nodeId: string, edges: Edge[]): number {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId).length;
}

function statusConfidence(node: Node<CanvasNode>): number {
  const data = node.data?.data as Record<string, unknown> | undefined;
  if (!data) return 0.3;

  if (node.data.type === CanvasNodeType.AI_ANALYSIS) {
    const confidence = data.confidence as number | undefined;
    const status = data.status as string | undefined;
    if (
      status === AIAnalysisNodeStatus.Complete &&
      typeof confidence === 'number'
    ) {
      return clamp(confidence / 100, 0, 1);
    }
    if (status === AIAnalysisNodeStatus.Running) return 0.6;
    return 0.3;
  }

  const status = data.status as string | undefined;
  if (!status) return 0.3;
  if (['complete', 'decided', 'on_track'].includes(status)) return 0.9;
  if (['active', 'reviewing', 'at_risk'].includes(status)) return 0.6;
  return 0.3;
}

function statusCompleteness(node: Node<CanvasNode>): number {
  const data = node.data?.data as Record<string, unknown> | undefined;
  if (!data) return 0;
  const status = data.status as string | undefined;
  if (!status) return 0;
  if (['complete', 'decided'].includes(status)) return 1;
  if (['active', 'reviewing', 'on_track'].includes(status)) return 0.6;
  return 0.2;
}

function dataFieldCoverage(node: Node<CanvasNode>): number {
  const data = node.data?.data as Record<string, unknown> | undefined;
  if (!data) return 0;
  const fields = Object.values(data).filter(
    (v) =>
      v !== null &&
      v !== undefined &&
      v !== '' &&
      !(Array.isArray(v) && v.length === 0),
  );
  const total = Object.keys(data).length;
  return total > 0 ? clamp(fields.length / total, 0, 1) : 0;
}

function freshness(node: Node<CanvasNode>): number {
  const data = node.data?.data as Record<string, unknown> | undefined;
  const dateStr = (data?.updatedAt ??
    data?.createdAt ??
    node.data?.data?.analyzedAt) as string | undefined;
  if (!dateStr) return 0.6;
  const daysSince =
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return clamp(1 - daysSince / FRESHNESS_DECAY_DAYS, 0, 1);
}

export interface NodeWithMetrics {
  node: Node<CanvasNode>;
  metrics: KnowledgeMetrics;
}

export function computeAllMetrics(
  nodes: Node<CanvasNode>[],
  edges: Edge[],
): NodeWithMetrics[] {
  const degrees = nodes.map((n) => edgeDegree(n.id, edges));
  const maxDegree = Math.max(...degrees, 1);

  return nodes.map((node, i) => {
    if (node.data.knowledgeMetrics) {
      return { node, metrics: node.data.knowledgeMetrics };
    }

    // Floor of 0.2 ensures isolated nodes still produce a visible hill.
    const contribution = 0.2 + 0.8 * (degrees[i] / maxDegree);
    const edgeConnectivity = degrees[i] / maxDegree;
    const maturity = clamp(
      0.4 * statusCompleteness(node) +
        0.4 * dataFieldCoverage(node) +
        0.2 * edgeConnectivity,
      0,
      1,
    );
    const confidence = statusConfidence(node);
    const consensus = 0.75;
    const fresh = freshness(node);

    return {
      node,
      metrics: {
        contribution,
        maturity,
        confidence,
        consensus,
        freshness: fresh,
      },
    };
  });
}
