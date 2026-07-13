export const CHAT_DEMO = {
  userMessage: 'Which accounts are most likely to churn this quarter?',
  steps: [
    { id: '1', title: 'Querying Salesforce CRM', durationMs: 1240 },
    {
      id: '2',
      title: 'Analyzing Amplitude engagement signals',
      durationMs: 890,
    },
    { id: '3', title: 'Calculating churn risk scores', durationMs: 340 },
  ],
  responseLines: [
    '**3 high-risk accounts identified** in the next 90 days, representing $2.4M ARR.',
    'Acme Corp has shown a 42% drop in product engagement over the past 6 weeks, with no recent support tickets — a strong signal of quiet churn.',
    'Recommend scheduling executive check-ins for Acme, Zenith, and Nova Systems before end of quarter.',
  ],
};

export type AgentStepData =
  | {
      kind: 'persona';
      label: string;
      subtitle: string;
      fields: { label: string; value: string }[];
    }
  | {
      kind: 'knowledge';
      label: string;
      subtitle: string;
      sources: { name: string; type: string; checked: boolean }[];
    }
  | {
      kind: 'toolkits';
      label: string;
      subtitle: string;
      toolkits: { name: string; checked: boolean }[];
    }
  | {
      kind: 'visibility';
      label: string;
      subtitle: string;
      people: { name: string; role: string }[];
      groups: { name: string; count: number }[];
    };

export const AGENT_STEPS: AgentStepData[] = [
  {
    kind: 'persona',
    label: 'Persona',
    subtitle: 'Define your agent',
    fields: [
      { label: 'Name', value: 'Sales Intelligence Agent' },
      {
        label: 'Role',
        value:
          'Analyzes pipeline health and surfaces revenue risks across your CRM',
      },
      { label: 'Model', value: 'claude-sonnet-4-6' },
    ],
  },
  {
    kind: 'knowledge',
    label: 'Knowledge',
    subtitle: 'Attach data context',
    sources: [
      { name: 'Salesforce CRM', type: 'CRM', checked: true },
      { name: 'Amplitude Analytics', type: 'Analytics', checked: true },
      { name: 'Intercom Support', type: 'Support', checked: false },
      { name: 'Stripe Billing', type: 'Payments', checked: true },
    ],
  },
  {
    kind: 'toolkits',
    label: 'Tools',
    subtitle: 'Select capabilities',
    toolkits: [
      { name: 'SQL Query', checked: true },
      { name: 'Web Search', checked: false },
      { name: 'File Analysis', checked: true },
      { name: 'Slack Notifications', checked: true },
      { name: 'Chart Generation', checked: false },
    ],
  },
  {
    kind: 'visibility',
    label: 'Visibility',
    subtitle: 'Set access',
    people: [
      { name: 'Sarah Chen', role: 'VP Sales' },
      { name: 'Marcus Rivera', role: 'Account Executive' },
    ],
    groups: [
      { name: 'Sales Team', count: 12 },
      { name: 'Revenue Ops', count: 5 },
    ],
  },
];

export interface CanvasNodeData {
  id: string;
  type: 'data_source' | 'metric' | 'goal' | 'ai_analysis';
  label: string;
  sublabel: string;
  x: number;
  y: number;
  accentColor: string;
}

export interface CanvasEdgeData {
  id: string;
  from: string;
  to: string;
}

export const CANVAS_NODES: CanvasNodeData[] = [
  {
    id: 'sf',
    type: 'data_source',
    label: 'Salesforce CRM',
    sublabel: 'Data Source',
    x: 15,
    y: 15,
    accentColor: '#4CAF50',
  },
  {
    id: 'amp',
    type: 'data_source',
    label: 'Amplitude',
    sublabel: 'Data Source',
    x: 15,
    y: 115,
    accentColor: '#4CAF50',
  },
  {
    id: 'churn',
    type: 'metric',
    label: 'Churn Rate',
    sublabel: 'Metric  4.2% ↑',
    x: 180,
    y: 15,
    accentColor: '#FF9800',
  },
  {
    id: 'arr',
    type: 'metric',
    label: 'ARR at Risk',
    sublabel: 'Metric  $2.4M',
    x: 180,
    y: 115,
    accentColor: '#FF9800',
  },
  {
    id: 'goal',
    type: 'goal',
    label: 'Reduce Churn 20%',
    sublabel: 'Q3 Goal',
    x: 345,
    y: 15,
    accentColor: '#2196F3',
  },
  {
    id: 'ai',
    type: 'ai_analysis',
    label: 'Churn Risk Analysis',
    sublabel: 'AI Analysis  76%',
    x: 345,
    y: 115,
    accentColor: '#5a0cff',
  },
];

export const CANVAS_EDGES: CanvasEdgeData[] = [
  { id: 'e1', from: 'sf', to: 'churn' },
  { id: 'e2', from: 'amp', to: 'arr' },
  { id: 'e3', from: 'churn', to: 'goal' },
  { id: 'e4', from: 'arr', to: 'ai' },
  { id: 'e5', from: 'churn', to: 'ai' },
];

export interface OntologyNodeData {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
}

export interface OntologyEdgeData {
  id: string;
  from: string;
  to: string;
  label: string;
}

export const ONTOLOGY_NODES: OntologyNodeData[] = [
  {
    id: 'customer',
    label: 'Customer',
    cx: 198,
    cy: 143,
    r: 38,
    color: '#5a0cff',
  },
  { id: 'order', label: 'Order', cx: 172, cy: 52, r: 26, color: '#2196F3' },
  { id: 'product', label: 'Product', cx: 335, cy: 83, r: 29, color: '#4CAF50' },
  {
    id: 'revenue',
    label: 'Revenue',
    cx: 326,
    cy: 194,
    r: 25,
    color: '#FF9800',
  },
  {
    id: 'account',
    label: 'Account',
    cx: 220,
    cy: 236,
    r: 28,
    color: '#9C27B0',
  },
  {
    id: 'campaign',
    label: 'Campaign',
    cx: 62,
    cy: 194,
    r: 27,
    color: '#E91E63',
  },
  {
    id: 'churn',
    label: 'Churn Event',
    cx: 68,
    cy: 87,
    r: 28,
    color: '#F44336',
  },
];

export const ONTOLOGY_EDGES: OntologyEdgeData[] = [
  { id: 'oe1', from: 'customer', to: 'order', label: 'Places' },
  { id: 'oe2', from: 'customer', to: 'product', label: 'Uses' },
  { id: 'oe3', from: 'customer', to: 'revenue', label: 'Generates' },
  { id: 'oe4', from: 'customer', to: 'account', label: 'OwnedBy' },
  { id: 'oe5', from: 'customer', to: 'campaign', label: 'Receives' },
  { id: 'oe6', from: 'customer', to: 'churn', label: 'Causes' },
];

export const SECONDARY_FEATURES = [
  {
    title: 'Data Hub',
    description:
      'Connect 30+ sources and query data in-browser with zero infrastructure.',
  },
  {
    title: 'Agent Monitoring',
    description:
      'Track token usage, session costs, and agent performance in one dashboard.',
  },
  {
    title: 'Automations',
    description:
      'Build if/then rules and let AI suggest automation opportunities.',
  },
  {
    title: 'Workflows',
    description:
      'Design multi-step automated processes with a drag-and-drop visual editor.',
  },
  {
    title: 'MCP Servers',
    description:
      'Extend agents with external tools via the Model Context Protocol.',
  },
  {
    title: 'Projects',
    description:
      'Organize work, files, and team collaboration around shared goals.',
  },
];
