import { Message } from 'models/interfaces/message';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';

/**
 * Converts an ordered list of AISessionEvents from a saved session into
 * Message objects suitable for rendering in the chat UI.
 *
 * Only ASSISTANT_REQUEST (user turn) and ASSISTANT_RESPONSE / ASSISTANT_PAUSED
 * (assistant turn) events are mapped — all other event types are ignored since
 * they represent intermediate processing steps that aren't needed for replay.
 */
export function sessionEventsToMessages(events: AISessionEvent[]): Message[] {
  const messages: Message[] = [];

  for (const event of events) {
    if (event.type === AISessionEventType.ASSISTANT_REQUEST) {
      messages.push({
        id: event.eventId,
        role: 'user',
        content: event.request.input,
        timestamp: new Date(event.timestamp).getTime(),
        sessionId: event.sessionId,
        eventId: event.eventId,
        requestId: event.requestId,
      });
    } else if (
      event.type === AISessionEventType.ASSISTANT_RESPONSE ||
      event.type === AISessionEventType.ASSISTANT_PAUSED
    ) {
      messages.push({
        id: event.eventId,
        role: 'assistant',
        content: event.response.output ?? '',
        timestamp: new Date(event.timestamp).getTime(),
        sessionId: event.sessionId,
        eventId: event.eventId,
        parentEventId: event.parentEventId,
        requestId: event.requestId,
        error: event.error,
      });
    }
  }

  return messages.sort((a, b) => a.timestamp - b.timestamp);
}
