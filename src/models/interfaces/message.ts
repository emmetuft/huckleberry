import { GraphContext } from '../../../shared/models/interfaces/userRequest';
import { ProcessStepWithUI } from 'reducers/chat/slice';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: GraphContext;
  processingSteps?: ProcessStepWithUI[];
}
