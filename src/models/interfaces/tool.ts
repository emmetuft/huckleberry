import { ToolStatus } from 'models/enums/toolStatus';

export interface ToolExecution {
  name: string;
  serverId: string;
  serverName?: string;
  params?: Record<string, unknown>;
  status: ToolStatus;
  executionTime?: number;
  content?: unknown;
  error?: string;
}

export interface ToolEventData {
  name: string;
  serverId: string;
  serverName?: string;
  params?: Record<string, unknown>;
  success?: boolean;
  executionTime?: number;
  content?: unknown;
  error?: string;
}
