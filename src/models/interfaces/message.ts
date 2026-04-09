import { ProcessedFile } from './files';
import { ProcessStepWithUI } from './processStep';
import {
  ConfirmationRequest,
  AssistantRequestEvent,
  AssistantResponseEvent,
  AssistantPausedEvent,
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

/**
 * A user-submitted message turn.
 * `event` is null for live-submitted messages before the server echoes
 * the ASSISTANT_REQUEST event back; always present for replayed sessions.
 */
export interface UserTurn {
  kind: TurnType.USER;
  id: string;
  timestamp: number;
  event: AssistantRequestEvent | null;
  content: string;
  // UI-only fields — will be populated once the agent framework returns them in events
  files?: ProcessedFile[];
  context?: { dataSourceIds: string[] };
}

/**
 * An assistant response turn.
 * `event` is null while the response is still streaming; set to the terminal
 * event (ASSISTANT_RESPONSE or ASSISTANT_PAUSED) once complete.
 * `requestId` is null until the first server event arrives.
 */
export interface AssistantTurn {
  kind: TurnType.ASSISTANT;
  id: string;
  timestamp: number;
  event: AssistantResponseEvent | AssistantPausedEvent | null;
  requestId: string | null;
  content: string;
  processingSteps: ProcessStepWithUI[];
  insights: AIInsight[];
  warnings: AIWarning[];
  confirmationRequests?: ConfirmationRequest[];
}

export enum TurnType {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export type ConversationTurn = UserTurn | AssistantTurn;
