import { InputType } from 'models/enums/inputType';
import { InputField } from 'components/shared/LabelInput/LabelInput';
import { Agent } from 'models/interfaces/agent';

export enum AgentStep {
  Persona = 'Persona',
  Knowledge = 'Knowledge',
  Tools = 'Tools',
  Visibility = 'Visibility',
}

export const AGENT_FORM_FIELDS: InputField<keyof Agent>[] = [
  {
    key: 'name',
    label: 'Name',
    inputType: InputType.Text,
    description: 'Set a recognizable name for your agent',
  },
  {
    key: 'description',
    label: 'Description',
    inputType: InputType.TextArea,
    description:
      'Create a description that will help your team know when to use this agent',
    inputProps: { autoSize: { minRows: 4 } },
  },
  {
    key: 'model',
    label: 'Model',
    inputType: InputType.Select,
    description: 'Choose the model that will power your agent',
  },
  {
    key: 'prompt',
    label: 'Role',
    inputType: InputType.TextArea,
    description:
      'Describe the purpose and behavior of the agent to guide its responses',
    inputProps: { autoSize: { minRows: 4 } },
  },
  {
    key: 'systemMessage',
    label: 'Instructions',
    inputType: InputType.TextArea,
    description: "Control your agent's behavior by adding custom instructions",
    inputProps: { autoSize: { minRows: 10 } },
  },
];

export enum DOMO_TOOLKIT_SCHEMA_ENTITY {
  DATA_SOURCE = 'dataSourceIds',
  CARD = 'cardIds',
  PAGE = 'pageIds',
  FILESET = 'filesetIds',
}

export enum AgentCategory {
  CUSTOMER_SUPPORT = 'Customer Support',
  DATA_ANALYSIS = 'Data Analysis',
  FINANCE = 'Finance',
  HUMAN_RESOURCES = 'Human Resources',
  IT_OPERATIONS = 'IT Operations',
  MARKETING = 'Marketing',
  PRODUCT = 'Product',
  RESEARCH = 'Research',
  SALES = 'Sales',
  SECURITY = 'Security',
}

export const agentCategories: { label: string; value: AgentCategory }[] = [
  { label: 'Customer Support', value: AgentCategory.CUSTOMER_SUPPORT },
  { label: 'Data Analysis', value: AgentCategory.DATA_ANALYSIS },
  { label: 'Finance', value: AgentCategory.FINANCE },
  { label: 'Human Resources', value: AgentCategory.HUMAN_RESOURCES },
  { label: 'IT Operations', value: AgentCategory.IT_OPERATIONS },
  { label: 'Marketing', value: AgentCategory.MARKETING },
  { label: 'Product', value: AgentCategory.PRODUCT },
  { label: 'Research', value: AgentCategory.RESEARCH },
  { label: 'Sales', value: AgentCategory.SALES },
  { label: 'Security', value: AgentCategory.SECURITY },
];
