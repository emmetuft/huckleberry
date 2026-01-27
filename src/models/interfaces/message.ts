import { GraphContext } from '../../../shared/models/interfaces/userRequest';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: GraphContext;
}
