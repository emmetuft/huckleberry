import { ProcessedFile } from './files';
import { ProcessStepWithUI } from './processStep';
import { GraphContext } from './userRequest';
import {
  ConfirmationRequest as SessionConfirmationRequest,
  AISessionError,
} from './sessionEvent';

export interface AIInsight {
  id: string;
  content: string;
  timestamp: number;
}

export interface AIWarning {
  id: string;
  message: string;
  timestamp: number;
}

export interface Message {
  // UI-specific fields
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: ProcessedFile[];
  context?: GraphContext;
  processingSteps?: ProcessStepWithUI[];
  insights?: AIInsight[];
  warnings?: AIWarning[];
  confirmationRequests?: SessionConfirmationRequest[];

  // Session event base fields
  sessionId?: string;
  eventId?: string;
  parentEventId?: string;
  requestId?: string;
  error?: AISessionError;
}
