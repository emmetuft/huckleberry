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
// import styles from './Agents.module.css';
import { selectTheme } from 'reducers/app/slice';
import { TEMPLATE_NODES } from 'constants/templates';
import { NodeType } from 'models/enums/nodeType';
import { Chat } from './Chat/Chat';
import { StartNode } from './Nodes/StartNode';
import { EndNode } from './Nodes/EndNode';
import { ActionNode } from './Nodes/ActionNode';

const nodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
  [NodeType.ACTION]: ActionNode,
};

interface AgentsProps {}

export const Agents: FC<AgentsProps> = ({}) => {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [nodes, setNodes, onNodesChange] = useNodesState(TEMPLATE_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep }, eds),
      );
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
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 2 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={25}
          size={2}
          color={isDark ? '#727272ff' : '#b7b6b6'}
          bgColor={isDark ? '#1a1a1a' : '#f6f6f6'}
        />
      </ReactFlow>
    </div>
  );
};
