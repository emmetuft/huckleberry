import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Edge,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { selectTheme } from 'reducers/app/slice';
import { TEMPLATE_NODES } from 'constants/templates';
import { GraphNodeType } from 'models/enums/nodeType';
import { ModelNode } from './Node';

const nodeTypes = {
  [GraphNodeType.ENTITY]: ModelNode,
};

interface ModelCanvasProps {}

export const ModelCanvas: FC<ModelCanvasProps> = ({}) => {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [nodes, setNodes, onNodesChange] = useNodesState(TEMPLATE_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      console.log('onConnect', params);
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep }, eds),
      );
    },
    [setEdges],
  );

  return (
    <ReactFlow
      style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.SmoothStep}
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
