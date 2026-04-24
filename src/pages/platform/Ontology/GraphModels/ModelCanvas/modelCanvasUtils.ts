import dagre from '@dagrejs/dagre';
import { Edge, MarkerType, Node } from '@xyflow/react';
import { GraphNodeType } from 'models/enums/nodeType';
import {
  GraphNodeModel,
  GraphRelationshipModel,
} from 'models/interfaces/ontology';
import { ModelNode } from './Node';
import { ModelEdge } from './ModelEdge';

export const nodeTypes = { [GraphNodeType.ENTITY]: ModelNode };
export const edgeTypes = { model: ModelEdge };

export const NODE_RADIUS = 45;
const NODE_SIZE = NODE_RADIUS * 2;

// Self-loop angles in degrees: NE, SE, SW, NW
export const SELF_LOOP_ANGLES = [315, 45, 225, 135];

export const buildNodes = (
  models: GraphNodeModel[],
  relationships: GraphRelationshipModel[],
  selectedModelId: string,
): Node[] => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

  models.forEach((model) =>
    g.setNode(model.id, { width: NODE_SIZE, height: NODE_SIZE }),
  );
  relationships.forEach((rel) => {
    if (rel.fromNodeId !== rel.toNodeId)
      g.setEdge(rel.fromNodeId, rel.toNodeId);
  });

  dagre.layout(g);

  return models.map((model) => {
    const { x, y } = g.node(model.id);
    return {
      id: model.id,
      type: GraphNodeType.ENTITY,
      position: { x: x - NODE_SIZE / 2, y: y - NODE_SIZE / 2 },
      data: { label: model.label, isActive: model.id === selectedModelId },
    };
  });
};

export const buildEdges = (relationships: GraphRelationshipModel[]): Edge[] => {
  const selfLoopCounters = new Map<string, number>();
  return relationships.map((rel) => {
    const isSelfLoop = rel.fromNodeId === rel.toNodeId;
    const base = {
      id: rel.id,
      source: rel.fromNodeId,
      target: rel.toNodeId,
      type: 'model' as const,
      label: rel.name,
      markerEnd: { type: MarkerType.ArrowClosed, width: 30, height: 30 },
    };
    if (isSelfLoop) {
      const count = selfLoopCounters.get(rel.fromNodeId) ?? 0;
      selfLoopCounters.set(rel.fromNodeId, count + 1);
      return {
        ...base,
        data: { loopAngle: SELF_LOOP_ANGLES[count % SELF_LOOP_ANGLES.length] },
      };
    }
    return base;
  });
};
