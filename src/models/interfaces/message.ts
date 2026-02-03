import { ProcessedFile } from '../../../shared/models/interfaces/files';
import { GraphContext } from '../../../shared/models/interfaces/userRequest';
import { ProcessStepWithUI } from 'reducers/chat/slice';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: ProcessedFile[];
  context?: GraphContext;
  processingSteps?: ProcessStepWithUI[];
}
