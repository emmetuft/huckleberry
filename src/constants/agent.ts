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
