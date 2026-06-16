// import { AgentCategory } from 'constants/agent';
import { Permission } from 'models/enums/permission';

export interface Agent {
  id: string;
  name: string;
  description: string;
  // category: AgentCategory;
  prompt: string;
  systemMessage: string;
  model: string;
  owner?: number;
  ownerDisplayName?: string;
  context?: AgentContext;
  toolkitIds?: string[];
  permission?: Permission;
  settings?: any;
  uiSettings?: any;
  theme?: any;
  created?: string;
  createdBy?: number;
  updated?: string;
  updatedBy?: number;
  iconUrl?: string;
}

export interface AgentContext {
  dataSourceIds?: string[];
  ignorableDataSourceIds?: string[];
  filters?: Object[];
  fileSets?: Object[];
}
