import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Select } from 'antd';
// import {
//   ReactFlow,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   BackgroundVariant,
//   Edge,
//   ConnectionLineType,
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';
import styles from './AgentDetail.module.css';
import { useAppDispatch } from 'reducers';
import { selectTheme } from 'reducers/app/slice';
import { selectAgents } from 'reducers/agents/slice';
import { createCustomAgent, fetchAIModels } from 'reducers/agents/actions';
import { AGENT_FORM_FIELDS, AgentStep } from 'constants/agent';
// import { TEMPLATE_NODES } from 'constants/templates';
// import { NodeType } from 'models/enums/nodeType';
// import { StartNode } from './Nodes/StartNode';
// import { EndNode } from './Nodes/EndNode';
// import { ActionNode } from './Nodes/ActionNode';
import { AccessEntry } from 'models/enums/permission';
import { Agent } from 'models/interfaces/agent';
import { Tool } from 'models/interfaces/toolkit';
import { Chat } from './Chat/Chat';
import { AgentStepContent } from './AgentStepContent';

// const nodeTypes = {
//   [NodeType.START]: StartNode,
//   [NodeType.END]: EndNode,
//   [NodeType.ACTION]: ActionNode,
// };

type AgentFormState = Partial<Agent>;

export const AgentDetail: FC = () => {
  const dispatch = useAppDispatch();
  const agents = useSelector(selectAgents);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [currentStep, setCurrentStep] = useState<AgentStep>(AgentStep.Persona);
  const [agentForm, setAgentForm] = useState<AgentFormState>({});
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [usersAndGroups, setUsersAndGroups] = useState<AccessEntry[]>([]);

  const { agentId } = useParams<{ agentId: string }>();
  const isNewAgent = agentId === 'new';
  const agent = isNewAgent
    ? null
    : (agents.find((a) => a.id === agentId) ?? null);

  useEffect(() => {
    dispatch(fetchAIModels());
  }, []);

  useEffect(() => {
    if (agent) {
      setAgentForm({
        name: agent.name,
        description: agent.description,
        model: agent.model,
      });
    }
  }, [agent]);

  const updateField = (key: keyof Agent, value: any) => {
    setAgentForm((prev) => ({ ...prev, [key]: value }));
  };

  const steps = Object.values(AgentStep);
  const isLastStep = currentStep === steps[steps.length - 1];

  const isPersonaComplete = AGENT_FORM_FIELDS.every((field) =>
    Boolean(agentForm[field.key]),
  );
  const isContinueDisabled =
    currentStep === AgentStep.Persona && !isPersonaComplete;

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleSubmit = () => {
    const { name, description, prompt, systemMessage, model } = agentForm;

    if (!name || !description || !prompt || !systemMessage || !model) {
      // TODO: surface validation errors to the user
      return;
    }

    dispatch(
      createCustomAgent({
        id: 'new',
        name,
        description,
        prompt,
        systemMessage,
        model,
        toolkitIds: [],
      }),
    );
  };

  // const [nodes, , onNodesChange] = useNodesState(TEMPLATE_NODES);
  // const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  // const onConnect = useCallback(
  //   (params: Parameters<typeof addEdge>[0]) => {
  //     setEdges((eds) =>
  //       addEdge({ ...params, type: ConnectionLineType.SmoothStep }, eds),
  //     );
  //   },
  //   [setEdges],
  // );

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
            {Object.values(AgentStep).map((step, index) => (
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
          <AgentStepContent
            currentStep={currentStep}
            agentForm={agentForm}
            onFieldChange={updateField}
            selectedTools={selectedTools}
            onToolsChange={setSelectedTools}
            usersAndGroups={usersAndGroups}
            onUsersAndGroupsChange={setUsersAndGroups}
          />
          <div className={styles.btnWrapper}>
            <Button
              type="primary"
              shape="round"
              disabled={isContinueDisabled}
              onClick={isLastStep ? handleSubmit : goToNextStep}
            >
              {isLastStep ? 'Done' : 'Continue'}
            </Button>
          </div>
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
