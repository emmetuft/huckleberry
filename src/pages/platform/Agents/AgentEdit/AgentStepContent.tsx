import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Select, Switch } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  GlobeIcon,
  LockSimpleIcon,
  MagicWandIcon,
  TrashIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import styles from './AgentEdit.module.css';
import labelInputStyles from 'components/shared/LabelInput/LabelInput.module.css';
import { selectAIModels } from 'reducers/agents/slice';
import { selectAllPeople } from 'reducers/people/slice';
import { AGENT_FORM_FIELDS, AgentStep } from 'constants/agent';
import { AccessEntry, Permission } from 'models/enums/permission';
import { Agent } from 'models/interfaces/agent';
import { Group, isUser, User } from 'models/interfaces/mention';
import { DataSource } from 'models/interfaces/dataSource';
import { Tool } from 'models/interfaces/toolkit';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { DataSourceBrowser } from 'components/shared/DataSourceBrowser/DataSourceBrowser';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import {
  FieldOption,
  InputField,
  LabelInput,
} from 'components/shared/LabelInput/LabelInput';
import PermissionSelect from 'components/shared/PermissionSelect';
import { ToolBrowser } from 'components/shared/ToolBrowser/ToolBrowser';
import AppTooltip from 'components/shared/Tooltip';
import { DomoAIService } from 'services/ai';
import { buildFieldGenerationPrompt } from 'utils/ai';

interface AgentStepContentProps {
  currentStep: AgentStep;
  agentForm: Partial<Agent>;
  onFieldChange: (key: keyof Agent, value: any) => void;
  selectedTools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
  selectedDataSources: DataSource[];
  onDataSourcesChange: (dataSources: DataSource[]) => void;
  usersAndGroups: AccessEntry[];
  onUsersAndGroupsChange: Dispatch<SetStateAction<AccessEntry[]>>;
}

// Unique key for a person, since a user and a group can share a numeric id
const personKey = (item: User | Group) =>
  `${isUser(item) ? 'user' : 'group'}-${item.id}`;

const personLabel = (item: User | Group) =>
  isUser(item) ? (item.displayName ?? item.username) : item.name;

const renderPrivacyNotice = (itemsAnd: string, itemsOr: string) => (
  <div className={styles.privacyNotice}>
    <LockSimpleIcon size={18} />
    <p className={styles.title}>Permissions stay as they are</p>
    <p className={styles.details}>
      {itemsAnd} keep their original permissions. Only people with existing
      access will have access here. To share with more people, update
      permissions for each {itemsOr} separately.
    </p>
  </div>
);

export const AgentStepContent: FC<AgentStepContentProps> = ({
  currentStep,
  agentForm,
  onFieldChange,
  selectedTools,
  onToolsChange,
  selectedDataSources,
  onDataSourcesChange,
  usersAndGroups,
  onUsersAndGroupsChange,
}) => {
  const aiModels = useSelector(selectAIModels);
  const allPeople = useSelector(selectAllPeople);
  const [generatingFields, setGeneratingFields] = useState<Set<keyof Agent>>(
    new Set(),
  );
  const [addAllWorkspaceContent, setAddAllWorkspaceContent] = useState(false);

  const modelOptions = aiModels.map((model) => ({
    label: model.name,
    value: model.id,
    description: model.description,
  }));

  const handleGenerateField = async (
    field: InputField<keyof Agent>,
    options?: FieldOption[],
  ) => {
    setGeneratingFields((prev) => new Set(prev).add(field.key));
    try {
      const context = AGENT_FORM_FIELDS.filter(
        (f) => f.key !== field.key && agentForm[f.key],
      )
        .map((f) => `${f.label}: ${agentForm[f.key]}`)
        .join('\n');

      const prompt = buildFieldGenerationPrompt(
        field.label,
        field.description ?? '',
        context,
        options,
      );

      const result = await DomoAIService.generateText(prompt);

      if (typeof result === 'string') {
        onFieldChange(field.key, result);
      } else {
        throw new Error('AI response missing "value" field');
      }
    } catch (error) {
      console.error('Failed to generate field with AI:', error);
      toast.error('Could not generate content. Please try again.');
    } finally {
      setGeneratingFields((prev) => {
        const next = new Set(prev);
        next.delete(field.key);
        return next;
      });
    }
  };

  const peopleOptions = allPeople
    .filter(
      (item) =>
        !usersAndGroups.some(
          (entry) => personKey(entry.member) === personKey(item),
        ),
    )
    .map((item) => ({
      value: personKey(item),
      label: personLabel(item),
      item,
    }));

  const handleAddPerson = (
    _value: string,
    option?: { item: User | Group } | { item: User | Group }[],
  ) => {
    if (!option) return;
    const { item } = Array.isArray(option) ? option[0] : option;
    onUsersAndGroupsChange((prev) => [
      ...prev,
      { member: item, permission: Permission.READ },
    ]);
  };

  const handlePermissionChange = (
    member: User | Group,
    permission: Permission,
  ) => {
    onUsersAndGroupsChange((prev) =>
      prev.map((entry) =>
        personKey(entry.member) === personKey(member)
          ? { ...entry, permission }
          : entry,
      ),
    );
  };

  const handleRemovePerson = (member: User | Group) => {
    onUsersAndGroupsChange((prev) =>
      prev.filter((entry) => personKey(entry.member) !== personKey(member)),
    );
  };

  switch (currentStep) {
    case AgentStep.Persona:
      return AGENT_FORM_FIELDS.map((field) => {
        const options = field.key === 'model' ? modelOptions : field.options;
        const isGenerating = generatingFields.has(field.key);
        return (
          <div key={field.key} className={styles.fieldWrapper}>
            <LabelInput
              inputType={field.inputType}
              label={field.label}
              description={field.description}
              options={options}
              inputProps={field.inputProps}
              value={agentForm[field.key] ?? ''}
              onChange={(val) => onFieldChange(field.key, val)}
            />
            {field.key !== 'name' && (
              <AppTooltip title="Generate with AI" mouseEnterDelay={1}>
                <Button
                  type="text"
                  shape="round"
                  icon={<MagicWandIcon />}
                  className={styles.magicIcon}
                  loading={isGenerating}
                  onClick={() => handleGenerateField(field, options)}
                />
              </AppTooltip>
            )}
          </div>
        );
      });
    case AgentStep.Knowledge:
      return (
        <div className={styles.pageContent}>
          <div className={labelInputStyles.labelInput}>
            <p className={labelInputStyles.label}>Knowledge</p>
            <p className={labelInputStyles.description}>
              Give your agent general knowledge around its topic
            </p>
            {!addAllWorkspaceContent && (
              <div className={labelInputStyles.inputWrapper}>
                <DataSourceBrowser
                  selectedDataSources={selectedDataSources}
                  onDataSourcesChange={onDataSourcesChange}
                />
              </div>
            )}
          </div>
          <div className={styles.knowledgeWrapper}>
            <AnimatePresence initial={false}>
              {addAllWorkspaceContent && (
                <motion.div
                  key="access-everything-notice"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className={styles.notice}>
                    <GlobeIcon size={18} />
                    <p style={{ fontWeight: '600' }}>Access everything</p>
                    <p>
                      This agent has access to all knowledge in this workspace
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className={`${styles.settingWithSwitch} ${!addAllWorkspaceContent ? styles.noBorder : ''}`}
            >
              <div
                className={`${labelInputStyles.labelInput} ${styles.settingContent}`}
              >
                <p className={labelInputStyles.label}>
                  Add all workspace content
                </p>
                <p className={labelInputStyles.description}>
                  Let the agent use all shared integrations, files, and other
                  assets in this workspace.
                </p>
              </div>
              <Switch
                checked={addAllWorkspaceContent}
                onChange={setAddAllWorkspaceContent}
              />
            </div>
            <div className={styles.settingWithSwitch}>
              <div
                className={`${labelInputStyles.labelInput} ${styles.settingContent}`}
              >
                <p className={labelInputStyles.label}>
                  Search the web for information
                </p>
                <p className={labelInputStyles.description}>
                  Let the agent search and reference information found on the
                  internet.
                </p>
              </div>
              <Switch />
            </div>
          </div>
          {renderPrivacyNotice('Files and integrations', 'file or integration')}
        </div>
      );
    case AgentStep.Tools:
      return (
        <div className={styles.pageContent}>
          <div className={labelInputStyles.labelInput}>
            <p className={labelInputStyles.label}>Tools</p>
            <p className={labelInputStyles.description}>
              Give your agent access to tools that it can use during execution
            </p>
            <div className={labelInputStyles.inputWrapper}>
              <ToolBrowser
                selectedTools={selectedTools}
                onToolsChange={onToolsChange}
                height={400}
              />
            </div>
          </div>
          {renderPrivacyNotice('Tools', 'tool')}
        </div>
      );
    case AgentStep.Visibility:
      return (
        <div className={styles.pageContent}>
          <div className={labelInputStyles.labelInput}>
            <p className={labelInputStyles.label}>Share with your team</p>
            <p className={labelInputStyles.description}>
              Configure the users and groups that can access this agent
            </p>
            <div className={labelInputStyles.inputWrapper}>
              <Select
                showSearch
                value={null}
                style={{ width: '100%' }}
                prefix={<UserCircleIcon />}
                placeholder="Add user or group"
                options={peopleOptions}
                onChange={handleAddPerson}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </div>
          </div>
          {usersAndGroups.length > 0 && (
            <div className={styles.accessWrapper}>
              <p className={styles.title}>People with access</p>
              {usersAndGroups.map(({ member, permission }) => (
                <div className={styles.accessItem} key={personKey(member)}>
                  {isUser(member) ? (
                    <Avatar
                      userId={member.id}
                      name={member.displayName}
                      showName
                      // height={30}
                    />
                  ) : (
                    <div className={styles.group}>
                      <div className={styles.groupIcon}>
                        <UsersThreeIcon size={20} />
                      </div>
                      <p>{member.name}</p>
                    </div>
                  )}
                  <div className={styles.group}>
                    <PermissionSelect
                      value={permission}
                      onChange={(value) =>
                        handlePermissionChange(member, value as Permission)
                      }
                    />
                    <IconBtn
                      icon={<TrashIcon />}
                      onClick={() => handleRemovePerson(member)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
};
