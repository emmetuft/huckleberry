import { AgentCategory } from 'constants/agent';

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  iconUrl?: string;
}
