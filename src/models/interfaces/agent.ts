// import { AgentCategory } from 'constants/agent';
import { Permission } from 'models/enums/permission';

export interface AgentSettings {
  id?: string | null;
  properties: {
    reasoningEffort?: string;
    allowSkipPlanning?: boolean;
    memoryRetrievalEnabled?: boolean;
    [key: string]: any;
  };
}

export interface AgentContext {
  dataSourceIds?: string[];
  ignorableDataSourceIds?: string[];
  cardIds?: string[];
  pageIds?: string[];
  filters?: Object[];
  fileSets?: Object[];
  dataApps?: any[];
  descriptions?: Record<string, string>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  // category: AgentCategory;
  prompt: string;
  systemMessage: string;
  model: string;
  owner: number;
  ownerDisplayName?: string;
  context?: AgentContext;
  toolkitIds?: string[];
  permission?: Permission;
  settings?: AgentSettings;
  uiSettings?: any;
  theme?: any;
  created?: string;
  createdBy?: number;
  updated?: string;
  updatedBy?: number;
  iconUrl?: string;
}

/** Write payload for create/update — omits server-managed fields. */
export interface AgentPayload {
  name: string;
  description: string;
  prompt: string;
  systemMessage: string;
  model?: string;
  settings?: AgentSettings;
  uiSettings?: Record<string, any>;
  theme?: Record<string, any>;
  context?: AgentContext;
  toolkitIds?: string[];
}
