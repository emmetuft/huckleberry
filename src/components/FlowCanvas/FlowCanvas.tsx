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
import styles from './FlowCanvas.module.scss';

import '@xyflow/react/dist/style.css';
import { StartNode } from './Nodes/StartNode';
import { NodeType } from 'models/enums/nodeType';
import { EndNode } from './Nodes/EndNode';

const nodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
};

const initialNodes = [
  {
    id: 'node-1',
    type: NodeType.START,
    position: { x: 0, y: 0 },
    data: { value: 123 },
  },
  {
    id: 'node-2',
    type: NodeType.END,
    position: { x: 0, y: 200 },
    data: { value: 123 },
  },
];
const initialEdges: Edge[] = [];

interface FlowCanvasProps {}

export const FlowCanvas: FC<FlowCanvasProps> = ({}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      console.log('onConnect', params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
          // color="#2c2b2a"
          // bgColor="white"
        />
      </ReactFlow>
    </div>
  );
};
