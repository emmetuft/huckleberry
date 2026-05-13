import { FC, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from 'reducers';
import { setNodePositions } from 'reducers/ontology/slice';
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
  onCreateNode: (
    nodeId: string,
    relId: string,
    fromNodeId: string,
    position: { x: number; y: number },
  ) => void;
  onMoveNode: (nodeId: string, position: { x: number; y: number }) => void;
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
  onMoveNode,
  onDeleteNode,
  onDeleteRelationship,
  isDark,
}) => {
  const dispatch = useAppDispatch();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasFitView = useRef(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildNodes(models, relationships, selectedModelId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    buildEdges(relationships),
  );

  useEffect(() => {
    if (!nodesInitialized) return;
    if (!hasFitView.current) {
      // Center nodes on initial load
      hasFitView.current = true;
      fitView({ padding: 0.3, maxZoom: 0.9 });
    }
    // Save initial node positions as determined by dagre layout
    const toSave: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      const model = models.find((m) => m.id === n.id);
      if (model && !model.position) toSave[n.id] = n.position;
    });
    if (Object.keys(toSave).length > 0) dispatch(setNodePositions(toSave));
  }, [nodesInitialized]);

  useEffect(() => {
    setNodes((prev) => {
      const posMap = new Map(prev.map((n) => [n.id, n.position]));
      const prevIds = new Set(prev.map((n) => n.id));
      const addingNewNode = !!selectedModelId && !prevIds.has(selectedModelId);
      const selectedSet = new Set(
        addingNewNode ? [] : prev.filter((n) => n.selected).map((n) => n.id),
      );
      return buildNodes(models, relationships, selectedModelId).map((n) => {
        const model = models.find((m) => m.id === n.id);
        return {
          ...n,
          position: model?.position ?? posMap.get(n.id) ?? n.position,
          selected: selectedSet.has(n.id) || n.id === selectedModelId,
        };
      });
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

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onMoveNode(node.id, node.position);
    },
    [onMoveNode],
  );

  const connectToExistingNode = useCallback(
    (
      fromNodeId: string,
      fromHandleId: string | null,
      toNodeId: string,
      targetHandleId?: string | null,
    ) => {
      const id = uuidv4();
      const isSelfLoop = fromNodeId === toNodeId;
      setEdges((eds) => [
        ...eds,
        {
          id,
          source: fromNodeId,
          target: toNodeId,
          sourceHandle: fromHandleId,
          targetHandle: targetHandleId ?? null,
          type: 'model' as const,
          data: isSelfLoop
            ? { loopAngle: getNextLoopAngle(fromNodeId) }
            : undefined,
        },
      ]);
      onCreateRelationship(id, fromNodeId, toNodeId);
    },
    [setEdges, onCreateRelationship, getNextLoopAngle],
  );

  const connectToNewNode = useCallback(
    (event: MouseEvent, fromNodeId: string, fromHandleId: string | null) => {
      const { clientX, clientY } = event;
      const position = screenToFlowPosition({ x: clientX, y: clientY });
      const nodeId = uuidv4();
      const relId = uuidv4();
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
      onCreateNode(nodeId, relId, fromNodeId, position);
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`.react-flow__node[data-id="${nodeId}"]`)
          ?.click();
      });
    },
    [setNodes, setEdges, onCreateNode, screenToFlowPosition],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      const fromNodeId = connectionState.fromNode?.id;
      const fromHandleId = connectionState.fromHandle?.id ?? null;
      if (!fromNodeId) return;

      if (connectionState.isValid) {
        const toNodeId = connectionState.toNode?.id;
        if (!toNodeId) return;
        connectToExistingNode(
          fromNodeId,
          fromHandleId,
          toNodeId,
          connectionState.toHandle?.id,
        );
        return;
      }

      const target = (event as MouseEvent).target as Element;
      const toNodeId = target
        .closest('.react-flow__node')
        ?.getAttribute('data-id');

      if (toNodeId) {
        connectToExistingNode(fromNodeId, fromHandleId, toNodeId);
      } else {
        connectToNewNode(event as MouseEvent, fromNodeId, fromHandleId);
      }
    },
    [connectToExistingNode, connectToNewNode],
  );

  const onDelete = useCallback(
    ({
      nodes: deletedNodes,
      edges: deletedEdges,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) => {
      const deletedNodeIds = new Set(deletedNodes.map((n) => n.id));
      deletedNodes.forEach((n) => onDeleteNode(n.id));
      deletedEdges
        .filter(
          (e) => !deletedNodeIds.has(e.source) && !deletedNodeIds.has(e.target),
        )
        .forEach((e) => onDeleteRelationship(e.id));
    },
    [onDeleteNode, onDeleteRelationship],
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
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        onNodeDragStop={onNodeDragStop}
        onDelete={onDelete}
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
          color={isDark ? '#727272ff' : '#c6c6c6'}
          bgColor={isDark ? '#1a1a1a' : '#ffffff'}
        />
      </ReactFlow>
    </div>
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
