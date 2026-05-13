import { AISessionEvent } from './sessionEvent';

export interface AgentSession {
  id: string;
  group: string;
  groupEntityId: string;
  name: string;
  userId: number;
  version: number;
  sessionContext: {
    dataSourceIds: string[];
    pageIds: string[];
    cardIds: string[];
    fileSets: string[];
  };
  created: string;
  lastActivity: string;
  events?: AISessionEvent[];
}
