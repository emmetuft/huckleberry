import { StreamType } from 'models/enums/stream';
import { ProcessStep } from 'models/interfaces/processStep';
import { ToolEventData } from 'models/interfaces/tool';
import { UserRequest } from 'models/interfaces/userRequest';

const CONTEXT_BUILDER_API_BASE = '/api/context';

export interface StreamMessage {
  type: StreamType;
  content?: string;
  message?: string;
  cypherQuery?: string;
  step?: ProcessStep;
  tool?: ToolEventData;
}

/** Raw Domo SSE event shape (type is SCREAMING_SNAKE_CASE) */
interface DomoEvent {
  type: string;
  sessionId?: string;
  requestId?: string;
  eventId?: string;
  parentEventId?: string | null;
  output?: string;
  service?: string;
  serviceResponse?: any;
  tool?: string;
  action?: string;
  actionType?: string;
  insight?: string;
  error?: string | null;
  duration?: number;
  description?: string;
  [key: string]: unknown;
}

/**
 * Map a raw Domo SSE event into our StreamMessage format.
 * Returns null for events we don't surface to the UI.
 */
function mapDomoEvent(event: DomoEvent): StreamMessage | null {
  switch (event.type) {
    case 'ASSISTANT_RESPONSE_CHUNK':
      return { type: StreamType.ANSWER, content: event.output ?? '' };

    case 'ASSISTANT_RESPONSE': {
      // The answer text may be in `output` or nested in `response`
      const text =
        event.output ||
        (event as any).response?.output ||
        (event as any).response?.text ||
        (event as any).response?.content ||
        '';
      return text ? { type: StreamType.ANSWER, content: text } : null;
    }

    case 'AI_SERVICE_RESPONSE':
      // These are internal service calls (session titles, etc.) — skip them
      return null;

    case 'ASSISTANT_RESPONSE_START':
      return { type: StreamType.THINKING, content: 'Generating response…' };

    case 'AI_INSIGHT':
      return { type: StreamType.THINKING, content: event.insight ?? '' };

    case 'ACTION_STARTED':
    case 'TOOL_STARTED':
      return {
        type: StreamType.TOOL_STARTED,
        step: {
          id: event.eventId ?? crypto.randomUUID(),
          title: `Running tool: ${event.action ?? event.tool ?? 'unknown'}`,
          status: 'in_progress' as any,
        },
      };

    case 'ACTION_COMPLETED':
    case 'TOOL_COMPLETED':
      return {
        type: StreamType.TOOL_COMPLETED,
        step: {
          id: event.parentEventId ?? event.eventId ?? crypto.randomUUID(),
          title: `Tool completed: ${event.actionType ?? event.tool ?? 'unknown'}`,
          status: 'complete' as any,
        },
      };

    default:
      if (event.error) {
        return { type: StreamType.ERROR, message: event.error };
      }
      return null;
  }
}

/**
 * Extract usable text from an AI_SERVICE_RESPONSE serviceResponse payload.
 */
function extractServiceResponseText(sr: unknown): string | null {
  if (!sr || typeof sr !== 'object') return null;
  const obj = sr as Record<string, unknown>;

  if (Array.isArray(obj.choices) && obj.choices.length > 0) {
    const first = obj.choices[0] as Record<string, unknown>;
    const text = (first.output ?? first.text ?? first.message) as
      | string
      | undefined;
    if (typeof text === 'string' && text.length > 0) return text;
  }

  for (const key of ['output', 'response', 'text', 'content']) {
    if (typeof obj[key] === 'string' && (obj[key] as string).length > 0) {
      return obj[key] as string;
    }
  }

  return null;
}

/** Set of our own event types emitted by the BFF (not from Domo) */
const BFF_EVENT_TYPES = new Set<string>([StreamType.ERROR]);

/**
 * Query using context builder and stream the response.
 *
 * The server passes through raw Domo SSE bytes untouched.
 * We handle both BFF error events and Domo events here.
 */
const queryStream = async function* (
  params: UserRequest,
): AsyncGenerator<StreamMessage, void, unknown> {
  console.log('[context.queryStream] starting request', {
    userInput: params.userInput?.slice(0, 80),
  });

  const response = await fetch(`${CONTEXT_BUILDER_API_BASE}/query-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  console.log('[context.queryStream] response', {
    status: response.status,
    ok: response.ok,
    hasBody: !!response.body,
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
  let rawChunkCount = 0;
  let yieldCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const rawChunk = decoder.decode(value, { stream: true });
    rawChunkCount++;
    if (rawChunkCount <= 5) {
      console.log(
        `[context.queryStream] raw chunk #${rawChunkCount} (${rawChunk.length} bytes):`,
        rawChunk.slice(0, 300),
      );
    }
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

      console.log('[context.queryStream] parsed event:', {
        type: parsed.type,
        keys: Object.keys(parsed).join(','),
      });
      if (parsed.type === 'ASSISTANT_RESPONSE') {
        console.log(
          '[context.queryStream] ASSISTANT_RESPONSE full payload:',
          JSON.stringify(parsed).slice(0, 1000),
        );
      }
      if (parsed.type === 'AI_SERVICE_RESPONSE') {
        console.log(
          '[context.queryStream] AI_SERVICE_RESPONSE description/service:',
          parsed.description,
          parsed.service,
        );
      }

      // Our own BFF events (ERROR) — yield directly
      if (BFF_EVENT_TYPES.has(parsed.type)) {
        yieldCount++;
        console.log(
          `[context.queryStream] yielding BFF event #${yieldCount}:`,
          parsed.type,
        );
        yield parsed as StreamMessage;
        continue;
      }

      // Raw Domo event — map to our StreamMessage format
      const mapped = mapDomoEvent(parsed as DomoEvent);
      if (mapped) {
        yieldCount++;
        console.log(
          `[context.queryStream] yielding mapped event #${yieldCount}:`,
          { type: mapped.type, contentLen: mapped.content?.length },
        );
      } else {
        console.log(
          '[context.queryStream] mapDomoEvent returned null for type:',
          parsed.type,
        );
      }
      if (mapped) {
        yield mapped;
      }
    }
  }

  console.log(
    `[context.queryStream] stream ended — ${rawChunkCount} raw chunks, ${yieldCount} events yielded, remaining buffer: "${buffer.slice(0, 100)}"`,
  );
};

export const AgentService = {
  queryStream,
};
