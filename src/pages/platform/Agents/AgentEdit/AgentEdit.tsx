import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Select, Spin } from 'antd';
import styles from './AgentEdit.module.css';
import { useAppDispatch } from 'reducers';
import { selectAgents, selectLoadingAgentId } from 'reducers/agents/slice';
import { createCustomAgent, fetchAgentById } from 'reducers/agents/actions';
import { AGENT_FORM_FIELDS, AgentStep } from 'constants/agent';
import { AccessEntry } from 'models/enums/permission';
import { Agent } from 'models/interfaces/agent';
import { DataSource } from 'models/interfaces/dataSource';
import { Tool } from 'models/interfaces/toolkit';
import { Chat } from '../Chat/Chat';
import { AgentStepContent } from './AgentStepContent';

type AgentFormState = Partial<Agent>;

export const AgentEdit: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const agents = useSelector(selectAgents);
  const loadingAgentId = useSelector(selectLoadingAgentId);

  const [currentStep, setCurrentStep] = useState<AgentStep>(AgentStep.Persona);
  const [agentForm, setAgentForm] = useState<AgentFormState>({});
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>(
    [],
  );
  const [usersAndGroups, setUsersAndGroups] = useState<AccessEntry[]>([]);

  const { agentId } = useParams<{ agentId: string }>();

  const agent = useMemo(() => {
    const isNewAgent = agentId === 'new';
    const currAgent = isNewAgent
      ? null
      : (agents.find((a) => a.id === agentId) ?? null);
    return currAgent;
  }, [agentId]);

  useEffect(() => {
    if (!agent && agentId && agentId !== 'new') {
      dispatch(fetchAgentById(agentId));
    }
  }, [agentId]);

  useEffect(() => {
    if (agent) {
      setAgentForm(agent);
    } else {
      setAgentForm({});
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

  if (loadingAgentId === agentId) {
    return (
      <div className={styles.loadingWrapper}>
        <Spin />
        <h4>Loading agent...</h4>
      </div>
    );
  }

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
            onChange={(value) => {
              navigate(`/agents/${value}/edit`);
            }}
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
            selectedDataSources={selectedDataSources}
            onDataSourcesChange={setSelectedDataSources}
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
    </div>
  );
};
