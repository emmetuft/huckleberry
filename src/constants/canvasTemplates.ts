import type { Edge, Node } from '@xyflow/react';
import { CanvasNodeType } from 'models/enums/nodeType';
import { CanvasEdgeType, EDGE_TYPE_LABELS } from 'models/enums/edgeType';
import { CanvasNode, CanvasNodeHint } from 'models/interfaces/canvasNode';
import { CanvasEdgeData } from 'models/interfaces/canvasEdge';

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node<CanvasNode>[];
  edges: Edge[];
}

function bestHandles(
  sp: { x: number; y: number },
  tp: { x: number; y: number },
): { sourceHandle: string; targetHandle: string } {
  const dx = tp.x - sp.x;
  const dy = tp.y - sp.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left', targetHandle: 'right' };
  }
  return dy >= 0
    ? { sourceHandle: 'bottom', targetHandle: 'top' }
    : { sourceHandle: 'top', targetHandle: 'bottom' };
}

function buildTemplate(
  id: string,
  name: string,
  description: string,
  nodes: Node<CanvasNode>[],
  edgeDefs: Array<[string, string, CanvasEdgeType]>,
): CanvasTemplate {
  const positions = Object.fromEntries(nodes.map((n) => [n.id, n.position]));
  const edges: Edge[] = edgeDefs.map(([source, target, relationship]) => ({
    id: `${source}-${target}`,
    source,
    target,
    ...bestHandles(positions[source], positions[target]),
    label: EDGE_TYPE_LABELS[relationship],
    data: { relationship } satisfies CanvasEdgeData,
  }));
  return { id, name, description, nodes, edges };
}

function node(
  id: string,
  type: CanvasNodeType,
  position: { x: number; y: number },
  hint?: CanvasNodeHint,
  nodeData?: unknown,
): Node<CanvasNode> {
  return {
    id,
    type,
    position,
    data: { id, type, data: nodeData, capabilities: {}, hint } as CanvasNode,
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  buildTemplate(
    'churn-analysis',
    'Churn analysis',
    'Understand churn signals and build a plan to reduce them.',
    [
      node(
        'ds-1',
        CanvasNodeType.DATA_SOURCE,
        { x: 0, y: 0 },
        {
          title: 'Customer Platform',
          description:
            'Connect analytics or CRM data to surface behavioral patterns and churn signals.',
        },
      ),
      node(
        'metric-1',
        CanvasNodeType.METRIC,
        { x: 400, y: 0 },
        {
          title: 'Monthly Churn Rate',
          description:
            'Track your current churn rate to establish a baseline and measure improvement.',
        },
      ),
      node(
        'goal-1',
        CanvasNodeType.GOAL,
        { x: 800, y: 0 },
        {
          title: 'Reduce Monthly Churn',
          description:
            'Define the retention goal, target date, and key results you want to hit this quarter.',
        },
      ),
      node(
        'person-1',
        CanvasNodeType.PERSON,
        { x: 1200, y: 0 },
        {
          description:
            'Add the customer success lead or account owner responsible for churn reduction.',
        },
      ),
      node(
        'ai-1',
        CanvasNodeType.AI_ANALYSIS,
        { x: 400, y: 480 },
        {
          description:
            'Connect a data source and metric above, then run the analysis to identify at-risk segments and churn patterns.',
        },
        {
          title: 'Churn Risk Analysis',
          status: 'not_started',
          summary: '',
          insights: [],
          model: '',
          confidence: 0,
          analyzedAt: '',
        },
      ),
    ],
    [
      ['ds-1', 'metric-1', CanvasEdgeType.Causes],
      ['ds-1', 'ai-1', CanvasEdgeType.Supports],
      ['metric-1', 'ai-1', CanvasEdgeType.Supports],
      ['metric-1', 'goal-1', CanvasEdgeType.Supports],
      ['goal-1', 'person-1', CanvasEdgeType.OwnedBy],
    ],
  ),
  buildTemplate(
    'okr-breakdown',
    'OKR breakdown',
    'Define objectives, track key results, and assign ownership.',
    [
      node(
        'goal-1',
        CanvasNodeType.GOAL,
        { x: 0, y: 0 },
        {
          title: 'Primary Objective',
          description:
            'Define the high-level objective your team is working toward this quarter.',
        },
      ),
      node(
        'metric-1',
        CanvasNodeType.METRIC,
        { x: 400, y: 0 },
        {
          title: 'Key Result Metric',
          description:
            "Add the primary metric that will tell you whether you're achieving the objective.",
        },
      ),
      node(
        'person-1',
        CanvasNodeType.PERSON,
        { x: 800, y: 0 },
        {
          description:
            'Add the DRI — the person accountable for hitting this objective.',
        },
      ),
      node(
        'decision-1',
        CanvasNodeType.DECISION,
        { x: 0, y: 430 },
        {
          title: 'Strategic Trade-off',
          description:
            'Capture a key decision that needs to be made to move this objective forward.',
        },
      ),
      node(
        'metric-2',
        CanvasNodeType.METRIC,
        { x: 400, y: 430 },
        {
          title: 'Supporting Metric',
          description:
            'Add a secondary metric to track progress on a specific key result.',
        },
      ),
      node(
        'project-1',
        CanvasNodeType.PROJECT,
        { x: 800, y: 430 },
        {
          title: 'Delivery Project',
          description:
            'Link the project responsible for doing the work that drives this objective.',
        },
      ),
    ],
    [
      ['goal-1', 'person-1', CanvasEdgeType.OwnedBy],
      ['goal-1', 'metric-1', CanvasEdgeType.Increases],
      ['goal-1', 'decision-1', CanvasEdgeType.Requests],
      ['goal-1', 'project-1', CanvasEdgeType.Requests],
      ['decision-1', 'project-1', CanvasEdgeType.Blocks],
      ['metric-2', 'project-1', CanvasEdgeType.Supports],
    ],
  ),
  buildTemplate(
    'stakeholder-map',
    'Stakeholder map',
    'Map the people, decisions, and ideas shaping a key initiative.',
    [
      node(
        'person-1',
        CanvasNodeType.PERSON,
        { x: 0, y: 0 },
        {
          description:
            'Add a key stakeholder who has influence over or is impacted by this initiative.',
        },
      ),
      node(
        'decision-1',
        CanvasNodeType.DECISION,
        { x: 400, y: 0 },
        {
          title: 'Key Decision',
          description:
            'Frame the central decision that stakeholders need to weigh in on or align around.',
        },
      ),
      node(
        'idea-1',
        CanvasNodeType.IDEA,
        { x: 800, y: 0 },
        {
          title: 'Proposed Direction',
          description:
            'Capture an idea or proposal that has been surfaced by a stakeholder or the team.',
        },
      ),
      node(
        'person-2',
        CanvasNodeType.PERSON,
        { x: 0, y: 380 },
        {
          description:
            'Add another stakeholder — a decision-maker, contributor, or informed party.',
        },
      ),
      node(
        'person-3',
        CanvasNodeType.PERSON,
        { x: 400, y: 380 },
        {
          description:
            'Add a third stakeholder, such as a subject matter expert or executive sponsor.',
        },
      ),
      node(
        'project-1',
        CanvasNodeType.PROJECT,
        { x: 800, y: 380 },
        {
          title: 'Active Initiative',
          description:
            'Connect the project this stakeholder map relates to so all context stays in one place.',
        },
      ),
    ],
    [
      ['person-1', 'decision-1', CanvasEdgeType.Requests],
      ['person-2', 'project-1', CanvasEdgeType.OwnedBy],
      ['person-3', 'decision-1', CanvasEdgeType.Supports],
      ['decision-1', 'project-1', CanvasEdgeType.Blocks],
      ['idea-1', 'decision-1', CanvasEdgeType.Supports],
    ],
  ),
];
