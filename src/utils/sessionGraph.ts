import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import { GraphData, GraphNode, GraphEdge } from 'models/interfaces/ontology';

export enum EventCategory {
  ASSISTANT = 'assistant',
  AI_SERVICE = 'aiService',
  ACTION = 'action',
  CONFIRMATION = 'confirmation',
  TOOL = 'tool',
  MCP = 'mcp',
  OTHER = 'other',
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  assistant: 'Assistant',
  aiService: 'AI Service',
  action: 'Action',
  confirmation: 'User Confirmation',
  tool: 'Tool',
  mcp: 'MCP',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  assistant: '#e0a030',
  aiService: '#705be7',
  action: '#6d8ae9',
  confirmation: '#30b8b0',
  tool: '#3a9e72',
  mcp: '#c45a4a',
  other: '#a4abc0',
};

export const getNodePrimaryLabel = (node: GraphNode): string => {
  const primaryLabel =
    node.labels.find(
      (l) => l !== 'Entity' && l !== 'AISessionEvent' && l !== 'AIContext',
    ) ?? node.labels[0];
  return primaryLabel ?? 'Unknown';
};

export function getNodeLabel(node: GraphNode): string {
  const p = node.properties as Record<string, any>;
  const primaryLabel = getNodePrimaryLabel(node);

  switch (primaryLabel) {
    case 'Session':
      return 'Session';
    case 'Request':
      return p.inputPreview ? String(p.inputPreview).slice(0, 50) : 'Request';
    case 'Generation':
      return p.service ?? 'Generation';
    case 'ThinkingStep':
      return 'Thinking';
    case 'ToolCall':
      return p.toolName ?? 'Tool';
    case 'ActionExecution':
      return p.actionType ?? 'Action';
    case 'McpExchange':
      return p.method ?? 'MCP';
    default:
      return p.name ?? primaryLabel ?? node.id;
  }
}

export function getEventCategory(type: AISessionEventType): EventCategory {
  switch (type) {
    case AISessionEventType.TOOL_STARTED:
    case AISessionEventType.TOOL_COMPLETED:
    case AISessionEventType.TOOL_FINISHED:
    case AISessionEventType.TOOL_PAUSED:
    case AISessionEventType.TOOL_RESUMED:
      return EventCategory.TOOL;
    case AISessionEventType.ACTION_STARTED:
    case AISessionEventType.ACTION_COMPLETED:
    case AISessionEventType.ACTION_PROMPT:
    case AISessionEventType.ACTION_REQUEST:
    case AISessionEventType.CARD_ACTION_RESPONSE_CHUNK:
      return EventCategory.ACTION;
    case AISessionEventType.AI_SERVICE_REQUEST:
    case AISessionEventType.AI_SERVICE_RESPONSE:
    case AISessionEventType.AI_DURATION:
      return EventCategory.AI_SERVICE;
    case AISessionEventType.ASSISTANT_REQUEST:
    case AISessionEventType.ASSISTANT_RESPONSE:
    case AISessionEventType.ASSISTANT_RESPONSE_START:
    case AISessionEventType.ASSISTANT_RESPONSE_END:
    case AISessionEventType.ASSISTANT_RESPONSE_CHUNK:
    case AISessionEventType.ASSISTANT_PAUSED:
    case AISessionEventType.AGENT_THINKING_STARTED:
    case AISessionEventType.AGENT_THINKING_COMPLETED:
    case AISessionEventType.CONFIRMATION_REQUEST:
      return EventCategory.ASSISTANT;
    case AISessionEventType.MCP_REQUEST:
    case AISessionEventType.MCP_RESPONSE:
    case AISessionEventType.MCP_NOTIFICATION:
      return EventCategory.MCP;
    default:
      return EventCategory.OTHER;
  }
}

const NOISE_TYPES = new Set<AISessionEventType>([
  AISessionEventType.AI_HEARTBEAT,
  AISessionEventType.AI_DURATION,
  AISessionEventType.ASSISTANT_RESPONSE_CHUNK,
  AISessionEventType.ASSISTANT_RESPONSE_START,
  AISessionEventType.ASSISTANT_RESPONSE_END,
  AISessionEventType.CARD_ACTION_RESPONSE_CHUNK,
]);

export function buildSessionGraph(events: AISessionEvent[]): GraphData {
  const filtered = events.filter((e) => !NOISE_TYPES.has(e.type));
  const eventMap = new Map(filtered.map((e) => [e.eventId, e]));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const event of filtered) {
    const category = getEventCategory(event.type);

    nodes.push({
      id: event.eventId,
      labels: [category, event.type],
      properties: {
        name: CATEGORY_LABELS[category],
        category,
        color: CATEGORY_COLORS[category],
        timestamp: event.timestamp,
        requestId: event.requestId,
        ...('durationMs' in event ? { durationMs: event.durationMs } : {}),
        ...('service' in event ? { service: event.service } : {}),
        ...('tool' in event ? { tool: event.tool } : {}),
        ...('actionType' in event ? { actionType: event.actionType } : {}),
      },
    });

    // CHILD_OF: parentEventId link
    if (event.parentEventId && eventMap.has(event.parentEventId)) {
      edges.push({
        id: `child-${event.eventId}`,
        source: event.parentEventId,
        target: event.eventId,
        type: 'CHILD_OF',
        properties: {},
      });
    }
  }

  // TRIGGERED: ToolStarted → ActionStarted via toolCallId
  const toolStartedByCallId = new Map<string, string>();
  for (const event of filtered) {
    if (event.type === AISessionEventType.TOOL_STARTED) {
      toolStartedByCallId.set(event.toolCallId, event.eventId);
    }
  }
  for (const event of filtered) {
    if (event.type === AISessionEventType.ACTION_STARTED) {
      const toolEventId = toolStartedByCallId.get(event.toolCallId);
      if (toolEventId) {
        edges.push({
          id: `triggered-${event.eventId}`,
          source: toolEventId,
          target: event.eventId,
          type: 'TRIGGERED',
          properties: {},
        });
      }
    }
  }

  // SEQUENCE: Connect events within the same requestId by temporal order.
  // Only connect nodes that don't already have inbound CHILD_OF edges,
  // linking them to the previous event in the turn.
  const nodesWithInbound = new Set(edges.map((e) => e.target));
  const byRequestId = new Map<string, AISessionEvent[]>();
  for (const event of filtered) {
    if (!byRequestId.has(event.requestId)) {
      byRequestId.set(event.requestId, []);
    }
    byRequestId.get(event.requestId)!.push(event);
  }

  for (const [, turnEvents] of byRequestId) {
    const sorted = [...turnEvents].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    for (let i = 1; i < sorted.length; i++) {
      if (nodesWithInbound.has(sorted[i].eventId)) continue;
      edges.push({
        id: `seq-${sorted[i].eventId}`,
        source: sorted[i - 1].eventId,
        target: sorted[i].eventId,
        type: 'SEQUENCE',
        properties: {},
      });
      nodesWithInbound.add(sorted[i].eventId);
    }
  }

  // Connect turns: link last event of turn N to first event of turn N+1
  const turnOrder = [...byRequestId.entries()]
    .map(([requestId, evts]) => ({
      requestId,
      firstTimestamp: Math.min(
        ...evts.map((e) => new Date(e.timestamp).getTime()),
      ),
      firstEventId: [...evts].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )[0].eventId,
      lastEventId: [...evts].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )[0].eventId,
    }))
    .sort((a, b) => a.firstTimestamp - b.firstTimestamp);

  for (let i = 1; i < turnOrder.length; i++) {
    edges.push({
      id: `turn-${turnOrder[i].requestId}`,
      source: turnOrder[i - 1].lastEventId,
      target: turnOrder[i].firstEventId,
      type: 'NEXT_TURN',
      properties: {},
    });
  }

  return { nodes, edges };
}
