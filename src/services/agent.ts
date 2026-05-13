import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { ResumeRequest, StreamRequest } from 'models/interfaces/userRequest';
import { handleResponse } from 'utils/service';

const AGENT_API_BASE = '/api/huckleberry';
const SESSION_API_BASE = '/api/sessions';

interface AgentStreamRequest {
  input: string;
  agentType?: string;
  sessionId?: string;
  aiAssistantContext?: any;
  model?: string;
}

/**
 * Shared helper function to process a streaming response
 * Handles SSE format (data:) or raw JSON lines
 */
async function* processStream(
  response: Response,
  logPrefix: string,
): AsyncGenerator<AISessionEvent, void, unknown> {
  if (!response.ok) {
    throw new Error(
      `Stream request failed: ${response.status} ${response.statusText}`,
    );
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let rawChunkCount = 0;
  let yieldCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const rawChunk = decoder.decode(value, { stream: true });
    rawChunkCount++;
    buffer += rawChunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.replace(/\r$/, '');

      // Extract JSON from SSE data field or raw JSON line
      let json: string | null = null;
      if (trimmed.startsWith('data:')) {
        json = trimmed.slice(5).trim() || null;
      } else if (trimmed.startsWith('{')) {
        json = trimmed;
      }
      if (!json) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(json);
      } catch {
        console.warn('[stream] unparseable SSE data:', json.slice(0, 200));
        continue;
      }

      yieldCount++;
      yield parsed;
    }
  }

  console.log(
    `[${logPrefix}] stream ended — ${rawChunkCount} raw chunks, ${yieldCount} events yielded, remaining buffer: "${buffer.slice(0, 100)}"`,
  );
}

/**
 * Send stream execution to agent
 */
const executeStream = async function* (
  params: StreamRequest,
  sessionId?: string,
): AsyncGenerator<AISessionEvent, void, unknown> {
  const requestBody: AgentStreamRequest = {
    input: params.userInput,
    sessionId,
    ...(params.dataSources && {
      aiAssistantContext: {
        dataSourceIds: params.dataSources,
      },
    }),
  };

  const response = await fetch(`${AGENT_API_BASE}/execute/streaming`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  yield* processStream(response, 'executeStream');
};

/**
 * Submit elicitation response to the agent and stream the resumed response
 * @param sessionId - The session ID
 * @param batchId - The batch ID for the elicitation requests
 * @param sourceRequestId - The source request ID
 * @param aiAssistantContext - The AI assistant context
 * @param responseItems - Array of responses with confirmationId, action, and content
 */
const resumeStream = async function* (
  params: ResumeRequest,
  sessionId: string,
): AsyncGenerator<AISessionEvent, void, unknown> {
  // Transform responseItems array into the nested items object structure
  const items = params.responseItems.reduce(
    (acc, item) => {
      acc[item.confirmationId] = {
        action: item.action,
        content: item.content,
      };
      return acc;
    },
    {} as Record<string, { action: string; content: Record<string, unknown> }>,
  );

  const response = await fetch(`${AGENT_API_BASE}/resume/streaming`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      batchId: params.batchId,
      sourceRequestId: params.sourceRequestId,
      aiAssistantContext: params.aiAssistantContext,
      response: {
        items,
      },
    }),
  });

  yield* processStream(response, 'resumeStream');
};

/**
 * Retrieve all agent sessions
 */
const getSessions = async (): Promise<AgentSession[]> => {
  const response = await fetch(`${SESSION_API_BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await handleResponse<{
    pageContext: any;
    sessions: AgentSession[];
  }>(response);
  return data.sessions.sort(
    (a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );
};

/**
 * Retrieve an agent session by session ID
 */
const getSession = async (sessionId: string): Promise<AgentSession> => {
  const response = await fetch(`${SESSION_API_BASE}/${sessionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return await handleResponse<AgentSession>(response);
};

/**
 * Retrieve all events for a given session ID
 */
const getSessionEvents = async (
  sessionId: string,
): Promise<AISessionEvent[]> => {
  const response = await fetch(`${SESSION_API_BASE}/${sessionId}/events`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await handleResponse<{
    events: AISessionEvent[];
    pageContext: { next: string };
    requestId: string | null;
    sessionId: string;
  }>(response);
  return data.events;
};

/**
 * Delete an agent session by session ID
 */
const deleteSession = async (sessionId: string): Promise<any> => {
  const response = await fetch(`${SESSION_API_BASE}/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  return await handleResponse<any>(response); // Returns empty string for data
};

export const AgentService = {
  executeStream,
  resumeStream,
  getSessions,
  getSession,
  getSessionEvents,
  deleteSession,
};
