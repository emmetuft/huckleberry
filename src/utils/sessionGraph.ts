import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import { GraphData, GraphNode, GraphEdge } from 'models/interfaces/ontology';

export type SessionNodeCategory =
  | 'userPrompt'
  | 'planThink'
  | 'getContext'
  | 'useContext'
  | 'modelCall'
  | 'answer'
  | 'other';

export const SESSION_NODE_COLORS: Record<SessionNodeCategory, string> = {
  userPrompt: '#6d8ae9',
  planThink: '#705be7',
  getContext: '#3a9e72',
  useContext: '#e0a030',
  modelCall: '#30b8b0',
  answer: '#bfff00',
  other: '#a4abc0',
};

const GET_CONTEXT_ACTIONS = new Set([
  'dataset_query_action',
  'dataset_lookup_action',
  'dataset_schema_by_id_action',
  'dataset_text_to_sql_action',
  'vector_db_query_action',
  'kb_query_action',
  'fileset_query_action',
  'search_action',
  'google_query_action',
  'firecrawl_action',
]);

const USE_CONTEXT_ACTIONS = new Set([
  'chart_builder_action',
  'page_builder_action',
  'html_generation_action',
  'javascript_generation_action',
  'code_engine_action',
  'card_action',
  'create_data_app_action',
  'design_app_spec_action',
]);

const NOISE_TYPES = new Set<AISessionEventType>([
  AISessionEventType.AI_HEARTBEAT,
  AISessionEventType.ASSISTANT_RESPONSE_CHUNK,
  AISessionEventType.ASSISTANT_RESPONSE_START,
  AISessionEventType.ASSISTANT_RESPONSE_END,
  AISessionEventType.CARD_ACTION_RESPONSE_CHUNK,
]);

function categorizeEvent(event: AISessionEvent): SessionNodeCategory {
  switch (event.type) {
    case AISessionEventType.ASSISTANT_REQUEST:
      return 'userPrompt';

    case AISessionEventType.ASSISTANT_RESPONSE:
    case AISessionEventType.ASSISTANT_PAUSED:
      return 'answer';

    case AISessionEventType.AI_SERVICE_REQUEST:
    case AISessionEventType.AI_SERVICE_RESPONSE:
      if ('service' in event && event.service === 'PLANNING')
        return 'planThink';
      return 'modelCall';

    case AISessionEventType.ACTION_STARTED:
    case AISessionEventType.ACTION_COMPLETED: {
      const actionType =
        'actionType' in event
          ? (event.actionType as string)?.toLowerCase()
          : '';
      if (GET_CONTEXT_ACTIONS.has(actionType)) return 'getContext';
      if (USE_CONTEXT_ACTIONS.has(actionType)) return 'useContext';
      return 'other';
    }

    case AISessionEventType.TOOL_STARTED:
    case AISessionEventType.TOOL_COMPLETED:
    case AISessionEventType.TOOL_FINISHED: {
      const tool = 'tool' in event ? (event.tool as string)?.toLowerCase() : '';
      for (const action of GET_CONTEXT_ACTIONS) {
        if (tool.includes(action.replace('_action', ''))) return 'getContext';
      }
      for (const action of USE_CONTEXT_ACTIONS) {
        if (tool.includes(action.replace('_action', ''))) return 'useContext';
      }
      return 'other';
    }

    case AISessionEventType.MCP_REQUEST:
    case AISessionEventType.MCP_RESPONSE:
      return 'other';

    default:
      return 'other';
  }
}

function getNodeLabel(event: AISessionEvent): string {
  switch (event.type) {
    case AISessionEventType.ASSISTANT_REQUEST:
      return event.request.input.slice(0, 60);
    case AISessionEventType.ASSISTANT_RESPONSE:
      return 'Response';
    case AISessionEventType.ASSISTANT_PAUSED:
      return 'Paused (awaiting confirmation)';
    case AISessionEventType.AI_SERVICE_REQUEST:
    case AISessionEventType.AI_SERVICE_RESPONSE:
      return event.service;
    case AISessionEventType.ACTION_STARTED:
    case AISessionEventType.ACTION_COMPLETED:
      return `${event.tool} (${event.actionType})`;
    case AISessionEventType.TOOL_STARTED:
      return event.tool;
    case AISessionEventType.TOOL_COMPLETED:
    case AISessionEventType.TOOL_FINISHED:
      return event.tool;
    case AISessionEventType.MCP_REQUEST:
      return `MCP: ${event.payload.method}`;
    default:
      return event.type;
  }
}

export function buildSessionGraph(events: AISessionEvent[]): GraphData {
  const filtered = events.filter((e) => !NOISE_TYPES.has(e.type));
  const eventMap = new Map(filtered.map((e) => [e.eventId, e]));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const event of filtered) {
    const category = categorizeEvent(event);

    nodes.push({
      id: event.eventId,
      labels: [category, event.type],
      properties: {
        name: getNodeLabel(event),
        category,
        color: SESSION_NODE_COLORS[category],
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
