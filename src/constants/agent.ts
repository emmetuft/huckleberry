import { Agent } from 'models/interfaces/agent';

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

export const AgentList: Agent[] = [
  {
    id: '1',
    name: 'Sales agent',
    description:
      'Qualifies inbound leads, drafts outreach, and keeps your pipeline moving.',
    category: AgentCategory.SALES,
  },
  {
    id: '2',
    name: 'Support triage',
    description:
      'Routes incoming tickets, suggests responses, and escalates urgent issues.',
    category: AgentCategory.CUSTOMER_SUPPORT,
  },
  {
    id: '3',
    name: 'Insights analyst',
    description:
      'Investigates trends across your data sources and surfaces anomalies.',
    category: AgentCategory.DATA_ANALYSIS,
  },
  {
    id: '4',
    name: 'Expense reviewer',
    description:
      'Flags out-of-policy spend and reconciles invoices against POs.',
    category: AgentCategory.FINANCE,
  },
  {
    id: '5',
    name: 'Onboarding buddy',
    description:
      'Walks new hires through paperwork, tooling access, and first-week tasks.',
    category: AgentCategory.HUMAN_RESOURCES,
  },
  {
    id: '6',
    name: 'Incident responder',
    description:
      'Watches alerts, opens runbooks, and notifies the on-call engineer.',
    category: AgentCategory.IT_OPERATIONS,
  },
  {
    id: '7',
    name: 'Campaign planner',
    description:
      'Drafts campaign briefs, suggests audiences, and tracks performance.',
    category: AgentCategory.MARKETING,
  },
  {
    id: '8',
    name: 'Roadmap scribe',
    description:
      'Summarizes user feedback into product themes and updates the roadmap.',
    category: AgentCategory.PRODUCT,
  },
  {
    id: '9',
    name: 'Research assistant',
    description:
      'Reads papers, extracts key findings, and compiles literature reviews.',
    category: AgentCategory.RESEARCH,
  },
  {
    id: '10',
    name: 'Threat watcher',
    description:
      'Monitors security feeds and prioritizes vulnerabilities affecting your stack.',
    category: AgentCategory.SECURITY,
  },
];
