import { InputType } from 'models/enums/inputType';
import { InputField } from 'components/shared/LabelInput/LabelInput';

export type AgentFieldKey = 'name' | 'description' | 'instructions' | 'model';

export type AgentStep = 'Persona' | 'Knowledge' | 'Workflows' | 'Visibility';

export const AGENT_STEPS: AgentStep[] = [
  'Persona',
  'Knowledge',
  'Workflows',
  'Visibility',
];

export const AGENT_FORM_FIELDS: Record<AgentStep, InputField<AgentFieldKey>[]> =
  {
    Persona: [
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
        description: 'Describe what this agent will help your team with',
        inputProps: { autoSize: { minRows: 4 } },
      },
      {
        key: 'instructions',
        label: 'Instructions',
        inputType: InputType.TextArea,
        description:
          "Control your agent's behavior by adding custom instructions",
        inputProps: { autoSize: { minRows: 10 } },
      },
      {
        key: 'model',
        label: 'Model',
        inputType: InputType.RadioCards,
        description: 'Choose the model that will power your agent',
        options: [
          {
            label: 'Default',
            value: 'default',
            description: 'Automatically pick the best model for the job',
          },
          {
            label: 'Claude Opus 4.7',
            value: 'opus4.7',
            description: 'Maximum intelligence for complex tasks',
          },
        ],
      },
    ],
    Knowledge: [],
    Workflows: [],
    Visibility: [],
  };

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
