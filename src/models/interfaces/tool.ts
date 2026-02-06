import { ToolExecutionStatus } from '../../../shared/models/enums/toolExecution';

export interface ToolExecution {
  name: string;
  serverId: string;
  serverName?: string;
  params?: Record<string, unknown>;
  status: ToolExecutionStatus;
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
