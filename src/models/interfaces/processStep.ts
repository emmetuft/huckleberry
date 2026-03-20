import { type AISessionEvent } from './sessionEvent';

export enum ProcessStepStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  FAILED = 'failed',
}

export enum ProcessStepType {
  ACTION = 'action',
  TOOL = 'tool',
  MCP = 'mcp',
  ASSISTANT = 'assistant',
}

/**
 * Represents a single step in the agent's execution process.
 * Each step is created from a _STARTED event and updated by subsequent events.
 */
export interface ProcessStep {
  /** Unique identifier - uses the eventId from the starting event */
  id: string;

  /** The type of process step */
  stepType: ProcessStepType;

  /** Current status of this step */
  status: ProcessStepStatus;

  /** Human-readable title for display */
  title: string;

  /** Optional description or additional context */
  description?: string;

  /** The starting event that created this step */
  startEvent: AISessionEvent;

  /** The completion/update event if available */
  endEvent?: AISessionEvent;

  /** Tool or action name */
  tool?: string;

  /** Action type category (for ACTION and TOOL events) */
  actionType?: string;

  /** Duration in milliseconds (from completed event) */
  durationMs?: number;

  /** Inputs/arguments for the action or tool */
  inputs?: Record<string, any>;

  /** Outputs/results from the action or tool */
  outputs?: any[];

  /** MCP-specific data */
  mcpData?: {
    method: string;
    direction: 'SENT' | 'RECEIVED';
    requestPayload?: any;
    responsePayload?: any;
  };

  /** Error if the step failed */
  error?: {
    message?: string;
    localizedMessage?: string;
    errorCode?: string;
  };

  /** Timestamp when the step started */
  startTime: string;

  /** Timestamp when the step completed */
  endTime?: string;
}

export interface ProcessStepWithUI extends ProcessStep {
  isOpen: boolean;
  subSteps?: ProcessStep[];
}
