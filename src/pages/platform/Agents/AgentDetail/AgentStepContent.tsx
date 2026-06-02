import { Dispatch, FC, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { Input, Select, Switch } from 'antd';
import {
  GlobeIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import styles from './AgentDetail.module.css';
import labelInputStyles from 'components/shared/LabelInput/LabelInput.module.css';
import { selectAIModels } from 'reducers/agents/slice';
import { selectAllPeople } from 'reducers/people/slice';
import { AGENT_FORM_FIELDS, AgentStep } from 'constants/agent';
import { Agent } from 'models/interfaces/agent';
import { Group, isUser, User } from 'models/interfaces/mention';
import { AccessEntry, Permission } from 'models/enums/permission';
import { Tool } from 'models/interfaces/toolkit';
import { LabelInput } from 'components/shared/LabelInput/LabelInput';
import { ToolBrowser } from 'components/shared/ToolBrowser/ToolBrowser';
import { Avatar } from 'components/shared/Avatar/Avatar';
import PermissionSelect from 'components/shared/PermissionSelect';

interface AgentStepContentProps {
  currentStep: AgentStep;
  agentForm: Partial<Agent>;
  onFieldChange: (key: keyof Agent, value: any) => void;
  selectedTools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
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
  usersAndGroups,
  onUsersAndGroupsChange,
}) => {
  const aiModels = useSelector(selectAIModels);
  const allPeople = useSelector(selectAllPeople);

  const modelOptions = aiModels.map((model) => ({
    label: model.name,
    value: model.id,
    description: model.description,
  }));

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

  switch (currentStep) {
    case AgentStep.Persona:
      return AGENT_FORM_FIELDS.map((field) => (
        <LabelInput
          key={field.key}
          inputType={field.inputType}
          label={field.label}
          description={field.description}
          options={field.key === 'model' ? modelOptions : field.options}
          inputProps={field.inputProps}
          value={agentForm[field.key] ?? ''}
          onChange={(val) => onFieldChange(field.key, val)}
        />
      ));
    case AgentStep.Knowledge:
      return (
        <div className={styles.pageContent}>
          <div className={labelInputStyles.labelInput}>
            <p className={labelInputStyles.label}>Knowledge</p>
            <p className={labelInputStyles.description}>
              Give your agent general knowledge around its topic
            </p>
            <div className={labelInputStyles.inputWrapper}>
              <Input
                prefix={<MagnifyingGlassIcon />}
                placeholder="Browse connected integrations, files, meetings, or other assets"
              />
            </div>
          </div>
          <div className={styles.knowledgeWrapper}>
            <div className={styles.notice}>
              <GlobeIcon size={18} />
              <p style={{ fontWeight: '600' }}>Access everything</p>
              <p>This agent has access to all knowledge in this workspace</p>
            </div>
            <div className={styles.settingWithSwitch}>
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
              <Switch />
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
                <PermissionSelect
                  value={permission}
                  onChange={(value) =>
                    handlePermissionChange(member, value as Permission)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};
