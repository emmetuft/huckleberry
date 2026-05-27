import { AgentCategory } from 'constants/agent';

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  model: string;
  owner: number;
  ownerDisplayName?: string;
  created: string;
  createdBy: number;
  updated: string;
  updatedBy: number;
  iconUrl?: string;
}
