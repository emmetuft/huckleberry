import { FC, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useNodesInitialized,
  BackgroundVariant,
  Edge,
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  Node,
  FinalConnectionState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { selectTheme } from 'reducers/app/slice';
import { GraphNodeType } from 'models/enums/nodeType';
import {
  GraphNodeModel,
  GraphRelationshipModel,
} from 'models/interfaces/ontology';
import { ConnectionLine } from './ConnectionLine';
import {
  buildEdges,
  buildNodes,
  edgeTypes,
  nodeTypes,
  SELF_LOOP_ANGLES,
} from './modelCanvasUtils';

export interface ModelCanvasProps {
  models: GraphNodeModel[];
  relationships: GraphRelationshipModel[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onCreateRelationship: (
    id: string,
    fromNodeId: string,
    toNodeId: string,
  ) => void;
  onCreateNode: (nodeId: string, relId: string, fromNodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteRelationship: (relId: string) => void;
}

const ModelCanvasContent: FC<ModelCanvasProps & { isDark: boolean }> = ({
  models,
  relationships,
  selectedModelId,
  onSelectModel,
  onCreateRelationship,
  onCreateNode,
  onDeleteNode,
  onDeleteRelationship,
  isDark,
}) => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildNodes(models, relationships, selectedModelId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    buildEdges(relationships),
  );

  useEffect(() => {
    if (nodesInitialized) fitView({ padding: 0.3, maxZoom: 0.9 });
  }, [nodesInitialized]);

  useEffect(() => {
    setNodes((prev) => {
      const posMap = new Map(prev.map((n) => [n.id, n.position]));
      const selectedSet = new Set(
        prev.filter((n) => n.selected).map((n) => n.id),
      );
      return buildNodes(models, relationships, selectedModelId).map((n) => ({
        ...n,
        position: posMap.get(n.id) ?? n.position,
        selected: selectedSet.has(n.id),
      }));
    });
  }, [models, relationships, selectedModelId]);

  useEffect(() => {
    setEdges((prev) => {
      const prevMap = new Map(prev.map((e) => [e.id, e]));
      return buildEdges(relationships).map((e) => ({
        ...prevMap.get(e.id),
        ...e,
      }));
    });
  }, [relationships]);

  const getNextLoopAngle = useCallback(
    (nodeId: string) => {
      const count = relationships.filter(
        (r) => r.fromNodeId === nodeId && r.toNodeId === nodeId,
      ).length;
      return SELF_LOOP_ANGLES[count % SELF_LOOP_ANGLES.length];
    },
    [relationships],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      const fromNodeId = connectionState.fromNode?.id;
      const fromHandleId = connectionState.fromHandle?.id ?? null;
      if (!fromNodeId) return;

      if (connectionState.isValid) {
        const toNodeId = connectionState.toNode?.id;
        if (!toNodeId) return;
        const id = `rel-${Date.now()}`;
        const isSelfLoop = fromNodeId === toNodeId;
        setEdges((eds) => [
          ...eds,
          {
            id,
            source: fromNodeId,
            target: toNodeId,
            sourceHandle: fromHandleId,
            targetHandle: connectionState.toHandle?.id ?? null,
            type: 'model' as const,
            data: isSelfLoop
              ? { loopAngle: getNextLoopAngle(fromNodeId) }
              : undefined,
          },
        ]);
        onCreateRelationship(id, fromNodeId, toNodeId);
        return;
      }

      const target = (event as MouseEvent).target as Element;
      const toNodeId = target
        .closest('.react-flow__node')
        ?.getAttribute('data-id');

      if (toNodeId) {
        const id = `rel-${Date.now()}`;
        const isSelfLoop = fromNodeId === toNodeId;
        setEdges((eds) => [
          ...eds,
          {
            id,
            source: fromNodeId,
            target: toNodeId,
            sourceHandle: fromHandleId,
            type: 'model' as const,
            data: isSelfLoop
              ? { loopAngle: getNextLoopAngle(fromNodeId) }
              : undefined,
          },
        ]);
        onCreateRelationship(id, fromNodeId, toNodeId);
      } else {
        const { clientX, clientY } = event as MouseEvent;
        const position = screenToFlowPosition({ x: clientX, y: clientY });
        const nodeId = `node-${Date.now()}`;
        const relId = `rel-${Date.now() + 1}`;
        setNodes((nds) => [
          ...nds,
          {
            id: nodeId,
            type: GraphNodeType.ENTITY,
            position,
            data: { label: 'New Node', isActive: false },
            selected: true,
          },
        ]);
        setEdges((eds) => [
          ...eds,
          {
            id: relId,
            source: fromNodeId,
            target: nodeId,
            sourceHandle: fromHandleId,
            type: 'model' as const,
          },
        ]);
        onCreateNode(nodeId, relId, fromNodeId);
        requestAnimationFrame(() => {
          document
            .querySelector<HTMLElement>(
              `.react-flow__node[data-id="${nodeId}"]`,
            )
            ?.click();
        });
      }
    },
    [
      setEdges,
      setNodes,
      onCreateRelationship,
      onCreateNode,
      screenToFlowPosition,
      getNextLoopAngle,
    ],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => deleted.forEach((n) => onDeleteNode(n.id)),
    [onDeleteNode],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => deleted.forEach((e) => onDeleteRelationship(e.id)),
    [onDeleteRelationship],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onSelectModel(node.id),
    [onSelectModel],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => onSelectModel(edge.id),
    [onSelectModel],
  );

  return (
    <ReactFlow
      style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnectEnd={onConnectEnd}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      connectionLineType={ConnectionLineType.Bezier}
      connectionLineComponent={ConnectionLine}
      connectionMode={ConnectionMode.Loose}
      isValidConnection={() => true}
      defaultEdgeOptions={{
        type: 'model',
        markerEnd: { type: MarkerType.ArrowClosed, width: 30, height: 30 },
      }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={25}
        size={2}
        color={isDark ? '#727272ff' : '#b7b6b6'}
        bgColor={isDark ? '#262626' : '#f6f6f6'}
      />
    </ReactFlow>
  );
};

export const ModelCanvas: FC<ModelCanvasProps> = (props) => {
  const theme = useSelector(selectTheme);
  return (
    <ReactFlowProvider>
      <ModelCanvasContent {...props} isDark={theme === 'dark'} />
    </ReactFlowProvider>
  );
};
