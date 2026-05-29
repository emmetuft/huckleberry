import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Badge, Button, Select } from 'antd';
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
import { StartNode } from './Nodes/StartNode';
import { EndNode } from './Nodes/EndNode';
import { ActionNode } from './Nodes/ActionNode';
import { LabelInput } from 'components/shared/LabelInput/LabelInput';
import { Agent } from 'models/interfaces/agent';
import {
  AGENT_FORM_FIELDS,
  AGENT_STEPS,
  AgentFieldKey,
  AgentStep,
} from 'constants/agent';
import { Chat } from './Chat/Chat';

const nodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
  [NodeType.ACTION]: ActionNode,
};

type AgentFormState = Partial<Agent> & { instructions?: string };

export const AgentDetail: FC = () => {
  const agents = useSelector(selectAgents);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [currentStep, setCurrentStep] = useState<AgentStep>(AGENT_STEPS[0]);
  const [agentForm, setAgentForm] = useState<AgentFormState>({});

  const { agentId } = useParams<{ agentId: string }>();
  const agent = agents.find((a) => a.id === agentId) ?? null;

  useEffect(() => {
    if (agent) {
      setAgentForm({
        name: agent.name,
        description: agent.description,
        model: agent.model,
      });
    }
  }, [agent]);

  const updateField = (key: AgentFieldKey, value: any) => {
    setAgentForm((prev) => ({ ...prev, [key]: value }));
  };

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
      <div className={styles.left}>
        <div className={styles.agentHeader}>
          <Select
            variant="borderless"
            value={agent?.id ?? 'new'}
            options={[
              { label: 'New agent', value: 'new' },
              ...agents.map((agent) => ({
                label: agent.name,
                value: agent.id,
              })),
            ]}
          />
          <Button shape="round" type="primary">
            Save
          </Button>
        </div>
        <div className={styles.agentContent}>
          <div className={styles.stepBtns}>
            {AGENT_STEPS.map((step, index) => (
              <Button
                key={step}
                shape="round"
                icon={
                  <div
                    className={`${styles.stepNumber} ${step === currentStep ? styles.currentStep : ''}`}
                  >
                    {step !== currentStep ? index + 1 : ''}
                  </div>
                }
                style={
                  step === currentStep
                    ? {
                        backgroundColor: 'var(--grey-light)',
                        borderColor: 'var(--grey-light)',
                      }
                    : {}
                }
                onClick={() => setCurrentStep(step)}
              >
                {step}
              </Button>
            ))}
          </div>
          {AGENT_FORM_FIELDS[currentStep].map((field) => (
            <LabelInput
              key={field.key}
              inputType={field.inputType}
              label={field.label}
              description={field.description}
              options={field.options}
              inputProps={field.inputProps}
              value={agentForm[field.key] ?? ''}
              onChange={(val) => updateField(field.key, val)}
            />
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.agentHeader}>
          <p className={styles.preview}>Preview</p>
        </div>
        <Chat agent={agent} showHeader={false} />
      </div>
      {/* <ReactFlow
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
      </ReactFlow> */}
    </div>
  );
};
