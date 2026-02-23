import { StreamStatus } from 'models/enums/stream';
import { ToolExecution } from './tool';
import { GraphContext } from './userRequest';

export interface ProcessStep {
  id: string;
  title: string;
  status: StreamStatus;
  details?: {
    strategyName?: string;
    graphContext?: GraphContext;
    metadata?: Record<string, any>;
    toolExecution?: ToolExecution;
  };
}

export interface ProcessStepWithUI extends ProcessStep {
  isOpen: boolean;
}
