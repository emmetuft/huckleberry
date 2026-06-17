import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { ResumeRequest, StreamRequest } from 'models/interfaces/userRequest';

const HUCKLEBERRY_API_BASE = '/api/huckleberry';
const AGENTS_API_BASE = '/api/agents';

interface AgentStreamRequest {
  input: string;
  sessionId?: string;
  aiAssistantContext?: any;
}

function getExecuteUrl(agentId?: string): string {
  if (agentId) return `${AGENTS_API_BASE}/${agentId}/execute/streaming`;
  return `${HUCKLEBERRY_API_BASE}/execute/streaming`;
}

function getResumeUrl(agentId?: string): string {
  if (agentId) return `${AGENTS_API_BASE}/${agentId}/resume/streaming`;
  return `${HUCKLEBERRY_API_BASE}/resume/streaming`;
}

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

const executeStream = async function* (
  params: StreamRequest,
  sessionId?: string,
  agentId?: string,
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

  const response = await fetch(getExecuteUrl(agentId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  yield* processStream(response, 'executeStream');
};

const resumeStream = async function* (
  params: ResumeRequest,
  sessionId: string,
  agentId?: string,
): AsyncGenerator<AISessionEvent, void, unknown> {
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

  const response = await fetch(getResumeUrl(agentId), {
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

export const AgentStreamService = {
  executeStream,
  resumeStream,
};
