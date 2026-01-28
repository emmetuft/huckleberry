import { FC, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Edge,
} from '@xyflow/react';
// import styles from './FlowCanvas.module.scss';

import '@xyflow/react/dist/style.css';
import { StartNode } from './Nodes/StartNode';
import { NodeType } from 'models/enums/nodeType';
import { EndNode } from './Nodes/EndNode';
import { ActionNode } from './Nodes/ActionNode';
import { TEMPLATE_NODES } from 'constants/templates';
import { Chat } from 'components/Workflows/Chat/Chat';

const nodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
  [NodeType.ACTION]: ActionNode,
};

interface FlowCanvasProps {}

export const FlowCanvas: FC<FlowCanvasProps> = ({}) => {
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
        {/* <Controls /> */}
        {/* <MiniMap /> */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={25}
          size={2}
          color="#b7b6b6"
          bgColor="white"
        />
      </ReactFlow>
    </div>
  );
};
