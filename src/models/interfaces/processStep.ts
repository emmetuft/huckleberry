import { StreamStatus } from '../../../shared/models/enums/stream';
import { GraphContext } from '../../../shared/models/interfaces/userRequest';
import { ToolExecution } from './tool';

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
