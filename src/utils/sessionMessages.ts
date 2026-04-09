import {
  AssistantTurn,
  ConversationTurn,
  TurnType,
  UserTurn,
} from 'models/interfaces/message';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import { applyEventToTurn } from 'utils/conversationTurn';

/**
 * Converts an ordered list of AISessionEvents from a saved session into
 * ConversationTurn objects suitable for rendering in the chat UI.
 *
 * Events are grouped by requestId and replayed in chronological order using
 * applyEventToTurn — the same logic that drives the live stream.
 */
export function sessionEventsToMessages(
  events: AISessionEvent[],
): ConversationTurn[] {
  const turns: ConversationTurn[] = [];

  // Group events by requestId so we can build each turn completely
  const eventsByRequest = new Map<string, AISessionEvent[]>();
  for (const event of events) {
    const group = eventsByRequest.get(event.requestId) ?? [];
    group.push(event);
    eventsByRequest.set(event.requestId, group);
  }

  for (const requestEvents of eventsByRequest.values()) {
    const sorted = [...requestEvents].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // User turn
    const requestEvent = sorted.find(
      (e) => e.type === AISessionEventType.ASSISTANT_REQUEST,
    );
    if (requestEvent) {
      const dataSourceIds =
        requestEvent.request.aiAssistantContext?.dataSourceIds;
      const userTurn: UserTurn = {
        kind: TurnType.USER,
        id: requestEvent.eventId,
        timestamp: new Date(requestEvent.timestamp).getTime(),
        event: requestEvent,
        content: requestEvent.request.input,
        context: dataSourceIds?.length ? { dataSourceIds } : undefined,
      };
      turns.push(userTurn);
    }

    // Assistant turn — only emit if a terminal event exists
    const terminalEvent = sorted.find(
      (e) =>
        e.type === AISessionEventType.ASSISTANT_RESPONSE ||
        e.type === AISessionEventType.ASSISTANT_PAUSED,
    );
    if (!terminalEvent) continue;

    let assistantTurn: AssistantTurn = {
      kind: TurnType.ASSISTANT,
      id: terminalEvent.eventId,
      timestamp: new Date(terminalEvent.timestamp).getTime(),
      event: null,
      requestId: terminalEvent.requestId,
      content: '',
      processingSteps: [],
      insights: [],
      warnings: [],
    };

    for (const event of sorted) {
      assistantTurn = applyEventToTurn(assistantTurn, event);
    }

    // Collapse steps for completed sessions — they're visible while streaming
    assistantTurn = {
      ...assistantTurn,
      processingSteps: assistantTurn.processingSteps.map((s) => ({
        ...s,
        isOpen: false,
      })),
    };

    turns.push(assistantTurn);
  }

  const sorted = turns.sort((a, b) => a.timestamp - b.timestamp);
  return sorted;
}
