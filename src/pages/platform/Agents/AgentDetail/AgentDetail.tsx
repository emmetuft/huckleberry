import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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
import styles from './AgentDetail.module.css';
import { selectTheme } from 'reducers/app/slice';
import { selectAgents } from 'reducers/agents/slice';
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

export const AgentDetail: FC = () => {
  const agents = useSelector(selectAgents);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const { agentId } = useParams<{ agentId: string }>();
  const agent = agents.find((a) => a.id === agentId) ?? null;

  const [nodes, , onNodesChange] = useNodesState(TEMPLATE_NODES);
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
    <div className={styles.agentWrapper}>
      <Chat agent={agent} />
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
