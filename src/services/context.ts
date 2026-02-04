import { StreamStatus, StreamType } from '../../shared/models/enums/stream';
import { ToolExecutionStatus } from '../../shared/models/enums/toolExecution';
import {
  GraphContext,
  UserRequest,
} from '../../shared/models/interfaces/userRequest';

const CONTEXT_BUILDER_API_BASE = '/api/context';

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

export interface ProcessStep {
  id: string;
  title: string;
  status: StreamStatus;
  details?: {
    selectedStrategies?: string[];
    strategyName?: string;
    graphContext?: GraphContext;
    metadata?: Record<string, any>;
    datasourceId?: string;
    query?: string;
    resultCount?: number;
    toolExecutions?: ToolExecution[];
  };
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

export interface StreamMessage {
  type: StreamType;
  content?: string;
  message?: string;
  context?: GraphContext;
  cypherQuery?: string;
  step?: ProcessStep;
  tool?: ToolEventData;
}

/**
 * Query using context builder and stream the response
 * Returns an async generator that yields stream messages
 */
const queryStream = async function* (
  params: UserRequest,
): AsyncGenerator<StreamMessage, void, unknown> {
  try {
    const response = await fetch(`${CONTEXT_BUILDER_API_BASE}/query-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to query context builder stream: ${response.status} ${response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const message: StreamMessage = JSON.parse(data);
            yield message;
          } catch (e) {
            console.error('Failed to parse SSE message:', e);
          }
        }
      }
    }
  } catch (error: any) {
    throw error;
  }
};

export const ContextService = {
  queryStream,
};
