import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Select, Spin } from 'antd';
import styles from './AgentEdit.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectAgents,
  selectLoadingAgentId,
  selectUpserting,
} from 'reducers/agents/slice';
import { fetchAgentById, upsertCustomAgent } from 'reducers/agents/actions';
import { AGENT_FORM_FIELDS, AgentStep } from 'constants/agent';
import { ChatMode } from 'models/enums/chatMode';
import { AccessEntry } from 'models/enums/permission';
import { Agent } from 'models/interfaces/agent';
import { DataSource } from 'models/interfaces/dataSource';
import { Toolkit } from 'models/interfaces/toolkit';
import { AgentStepContent } from './AgentStepContent';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';

type AgentFormState = Partial<Agent>;

export const AgentEdit: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const agents = useSelector(selectAgents);
  const loadingAgentId = useSelector(selectLoadingAgentId);
  const upserting = useSelector(selectUpserting);

  const [currentStep, setCurrentStep] = useState<AgentStep>(AgentStep.Persona);
  const [agentForm, setAgentForm] = useState<AgentFormState>({});
  const [selectedToolkits, setSelectedToolkits] = useState<Toolkit[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>(
    [],
  );
  const [usersAndGroups, setUsersAndGroups] = useState<AccessEntry[]>([]);

  const { agentId } = useParams<{ agentId: string }>();
  const isNewAgent = agentId === 'new';

  const agent = useMemo(() => {
    const currAgent = isNewAgent
      ? null
      : (agents.find((a) => a.id === agentId) ?? null);
    return currAgent;
  }, [agentId, agents, isNewAgent]);

  useEffect(() => {
    if (!agent && agentId && agentId !== 'new') {
      dispatch(fetchAgentById(agentId));
    }
  }, [agentId]);

  useEffect(() => {
    if (agent) {
      setAgentForm(agent);
      // TODO: Fetch toolkits by IDs
      // setSelectedToolkitIds(agent.toolkitIds ?? []);
    } else {
      setAgentForm({});
      setSelectedToolkits([]);
    }
    setCurrentStep(AgentStep.Persona);
  }, [agent]);

  const updateField = (key: keyof Agent, value: any) => {
    setAgentForm((prev) => ({ ...prev, [key]: value }));
  };

  const steps = Object.values(AgentStep);
  const isLastStep = currentStep === steps[steps.length - 1];

  const isPersonaComplete = AGENT_FORM_FIELDS.every((field) =>
    Boolean(agentForm[field.key]),
  );
  const isToolkitSelected = selectedToolkits.length > 0;

  const hasChanges = useMemo(() => {
    if (isNewAgent) return true;
    if (!agent) return false;
    const formChanged = AGENT_FORM_FIELDS.some(
      (field) => agentForm[field.key] !== agent[field.key],
    );
    const toolkitsChanged =
      JSON.stringify([...selectedToolkits].sort()) !==
      JSON.stringify([...(agent.toolkitIds ?? [])].sort());
    return formChanged || toolkitsChanged;
  }, [agentForm, selectedToolkits, agent, isNewAgent]);

  const isContinueDisabled =
    currentStep === AgentStep.Persona && !isPersonaComplete;
  const isSaveDisabled =
    !isPersonaComplete || !isToolkitSelected || !hasChanges;

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleSubmit = async () => {
    if (!agentId) return;
    const { name, description, prompt, systemMessage, model } = agentForm;

    if (!name || !description || !prompt || !systemMessage || !model) {
      return;
    }

    const context = {
      dataSourceIds: selectedDataSources.map((ds) => ds.id),
      fileSets: [],
    };

    const result = await dispatch(
      upsertCustomAgent({
        id: agentId,
        name,
        description,
        prompt,
        systemMessage,
        model,
        toolkitIds: selectedToolkits.map((tk) => tk.toolkitId),
        context,
        settings: agentForm.settings,
      }),
    );
    if (upsertCustomAgent.fulfilled.match(result)) {
      toast.success(`Agent ${isNewAgent ? 'created' : 'updated'} successfully`);
    }
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
          <Button
            shape="round"
            type="primary"
            onClick={handleSubmit}
            loading={upserting}
            disabled={isSaveDisabled}
          >
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
            selectedToolkits={selectedToolkits}
            onToolkitsChange={setSelectedToolkits}
            selectedDataSources={selectedDataSources}
            onDataSourcesChange={setSelectedDataSources}
            usersAndGroups={usersAndGroups}
            onUsersAndGroupsChange={setUsersAndGroups}
          />
          <div className={styles.btnWrapper}>
            {!isLastStep && (
              <Button
                type="primary"
                shape="round"
                disabled={isContinueDisabled}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.agentHeader}>
          <p className={styles.preview}>Preview</p>
        </div>
        <ChatContainer chatMode={ChatMode.panel} placeholder={'Ask anything'} />
      </div>
    </div>
  );
};
