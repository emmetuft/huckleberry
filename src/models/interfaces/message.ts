import { ProcessedFile } from './files';
import { ProcessStepWithUI } from './processStep';
import { GraphContext } from './userRequest';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: ProcessedFile[];
  context?: GraphContext;
  processingSteps?: ProcessStepWithUI[];
}
