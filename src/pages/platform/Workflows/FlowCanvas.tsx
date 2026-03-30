import { FC, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Edge,
} from '@xyflow/react';
// import styles from './FlowCanvas.module.css';

import '@xyflow/react/dist/style.css';
import { TEMPLATE_NODES } from 'constants/templates';
import { NodeType } from 'models/enums/nodeType';
import { Chat } from './Chat/Chat';
import { StartNode } from './Nodes/StartNode';
import { EndNode } from './Nodes/EndNode';
import { ActionNode } from './Nodes/ActionNode';
import { useSelector } from 'react-redux';
import { selectTheme } from 'reducers/app/slice';

const nodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
  [NodeType.ACTION]: ActionNode,
};

interface FlowCanvasProps {}

export const FlowCanvas: FC<FlowCanvasProps> = ({}) => {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [nodes, setNodes, onNodesChange] = useNodesState(TEMPLATE_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      console.log('onConnect', params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Chat />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={25}
          size={2}
          color={isDark ? '#727272ff' : '#b7b6b6'}
          bgColor={isDark ? '#1a1a1a' : 'white'}
        />
      </ReactFlow>
    </div>
  );
};
