// ─── Primitives ───────────────────────────────────────────────────────────────

export enum AISessionEventType {
  ASSISTANT_REQUEST = 'ASSISTANT_REQUEST',
  ASSISTANT_RESPONSE = 'ASSISTANT_RESPONSE',
  ASSISTANT_RESPONSE_START = 'ASSISTANT_RESPONSE_START',
  ASSISTANT_RESPONSE_END = 'ASSISTANT_RESPONSE_END',
  ASSISTANT_RESPONSE_CHUNK = 'ASSISTANT_RESPONSE_CHUNK',
  /** Wire name is "ASSISTANT_PAUSED_RESPONSE". */
  ASSISTANT_PAUSED = 'ASSISTANT_PAUSED_RESPONSE',
  ASSISTANT_RESUMED = 'ASSISTANT_RESUMED',
  ACTION_PROMPT = 'ACTION_PROMPT',
  ACTION_REQUEST = 'ACTION_REQUEST',
  ACTION_STARTED = 'ACTION_STARTED',
  ACTION_COMPLETED = 'ACTION_COMPLETED',
  AI_SERVICE_REQUEST = 'AI_SERVICE_REQUEST',
  AI_SERVICE_RESPONSE = 'AI_SERVICE_RESPONSE',
  CARD_ACTION_RESPONSE_CHUNK = 'CARD_ACTION_RESPONSE_CHUNK',
  AI_INSIGHT = 'AI_INSIGHT',
  AI_WARNING = 'AI_WARNING',
  AI_DURATION = 'AI_DURATION',
  AI_HEARTBEAT = 'AI_HEARTBEAT',
  /** Wire name is "CANCEL". */
  AI_CANCEL = 'CANCEL',
  TOOL_STARTED = 'TOOL_STARTED',
  TOOL_COMPLETED = 'TOOL_COMPLETED',
  /** @deprecated Alias for TOOL_COMPLETED. */
  TOOL_FINISHED = 'TOOL_FINISHED',
  TOOL_PAUSED = 'TOOL_PAUSED',
  TOOL_RESUMED = 'TOOL_RESUMED',
  FILE_GENERATED = 'FILE_GENERATED',
  MCP_REQUEST = 'MCP_REQUEST',
  MCP_RESPONSE = 'MCP_RESPONSE',
  MCP_NOTIFICATION = 'MCP_NOTIFICATION',
  CONFIRMATION_REQUEST = 'CONFIRMATION_REQUEST',
  UNKNOWN = 'UNKNOWN',
}

type AIWarningEventType = 'LOCALIZED_WARNING' | 'UNKNOWN';
type AIInsight = 'PAGE_GEN_TOPICS' | 'PAGE_GEN_STATISTICS' | 'UNKNOWN';

/** Enum for confirmation request types - for use in application code */
export enum ConfirmationType {
  TOOL_CONFIRMATION = 'TOOL_CONFIRMATION',
  TASK_PLAN_CONFIRMATION = 'TASK_PLAN_CONFIRMATION',
  FOLLOW_UP_QUESTIONS = 'FOLLOW_UP_QUESTIONS',
  TOOL_PAUSE = 'TOOL_PAUSE',
  MCP_ELICITATION = 'MCP_ELICITATION',
}

/** Export the ConfirmationRequest interface */
export type { ConfirmationRequest };
type McpMessageDirection = 'SENT' | 'RECEIVED';
type McpMessageType = 'REQUEST' | 'RESPONSE' | 'NOTIFICATION';
type McpMethod =
  | 'initialize'
  | 'tools/list'
  | 'tools/call'
  | 'resources/list'
  | 'resources/read'
  | 'ping'
  | 'notifications/initialized'
  | 'notifications/tools/list_changed'
  | 'notifications/resources/list_changed'
  | 'elicitation/create';

// ─── Shared Supporting Types ──────────────────────────────────────────────────

/** Structured error attached to any event when something goes wrong. */
export interface AISessionError {
  /** Localized, user-facing error message. */
  localizedMessage?: string;
  /** Raw internal error message. */
  message?: string;
  /** Machine-readable error code. */
  errorCode?: string;
  /** HTTP status code associated with the error. */
  responseStatus: number;
  /** Additional error context. */
  details?: Record<string, unknown>;
}

/**
 * A typed input or output value for an action or tool.
 * The `type` discriminator identifies the concrete implementation.
 */
interface ActionIO {
  /** Concrete type of this IO value (e.g. "TEXT", "DATASET", "CARD"). */
  type: string;
  /** The payload. Shape varies by type. */
  value: unknown;
  /** Plain-text representation suitable for display. */
  stringValue?: string;
  /** IDs of source data (datasets, cards, etc.) that contributed to this value. */
  sourceReferences?: string[];
}

/** A request for the user to provide input or approval before execution continues. */
interface ConfirmationRequest {
  /** What kind of confirmation is needed. */
  type: ConfirmationType;
  /** Human-readable explanation of what needs confirming. */
  message: string;
  /** Optional short title for a dialog header. */
  title?: string;
  /** JSON Schema describing the shape of the expected user response. */
  requestedSchema: unknown;
  /** Arbitrary display data for rendering the confirmation UI. */
  content: Record<string, unknown>;
  /** Unique ID for this confirmation item. */
  confirmationId: string;
  /** Groups multiple confirmations that arrived together. */
  batchId: string;
  /** The name of the tool being called. */
  name?: string;
  /** The tool call ID. */
  toolCallId?: string;
}

/** Structured chart row data streamed during card action chunks. */
interface AIChartRow {
  rowId?: string;
  title?: string;
  xAxis?: string;
  yAxis?: string;
  aggregation?: string;
  series?: string;
  chartType?: string;
  contentGroup?: string;
  justification?: string;
  description?: string;
}

// ─── MCP Payload Types ────────────────────────────────────────────────────────

interface McpRequestPayload {
  messageType: 'REQUEST';
  protocolVersion: string;
  jsonrpcVersion: string;
  method: McpMethod;
  id: string | number;
  params?: unknown;
}

interface McpResponsePayload {
  messageType: 'RESPONSE';
  protocolVersion: string;
  jsonrpcVersion: string;
  method: McpMethod;
  id: string | number;
  result?: unknown;
  error?: Record<string, unknown>;
}

interface McpNotificationPayload {
  messageType: 'NOTIFICATION';
  protocolVersion: string;
  jsonrpcVersion: string;
  method: McpMethod;
  params?: unknown;
}

type McpJsonRpcPayload =
  | McpRequestPayload
  | McpResponsePayload
  | McpNotificationPayload;

// ─── Base ─────────────────────────────────────────────────────────────────────

interface AISessionEventBase {
  /** Identifies the active conversation session. */
  sessionId: string;
  /** Unique ID for this event instance. */
  eventId: string;
  /**
   * Links to the logical parent event.
   * Response/completed events point to their corresponding request/started event.
   * Sub-events spawned from a parent request point to that parent's eventId.
   */
  parentEventId?: string;
  /** Groups all events produced while handling one user message. */
  requestId: string;
  /** ISO-8601 timestamp of when the event was created. */
  timestamp: string;
  /** Present when an error occurred at this step. */
  error?: AISessionError;
}

// ─── Event Types ──────────────────────────────────────────────────────────────

/** User or system submitted a new message to the assistant. */
interface AssistantRequestEvent extends AISessionEventBase {
  type: AISessionEventType.ASSISTANT_REQUEST;
  request: {
    sessionId: string;
    /** The user's input text. */
    input: string;
    requestId: string;
  };
}

/** The assistant produced a complete response. */
interface AssistantResponseEvent extends AISessionEventBase {
  type: AISessionEventType.ASSISTANT_RESPONSE;
  response: {
    /** The full generated text output. */
    output: string | null;
    /** Pending confirmations if the response was paused before completing. */
    confirmationRequests?: ConfirmationRequest[];
  };
  /** Total time from request to response in milliseconds. */
  duration?: number;
}

/** Streaming is about to begin — no payload beyond the base. */
interface AssistantResponseStartEvent extends AISessionEventBase {
  type: AISessionEventType.ASSISTANT_RESPONSE_START;
}

/** Streaming has ended — no payload beyond the base. */
interface AssistantResponseEndEvent extends AISessionEventBase {
  type: AISessionEventType.ASSISTANT_RESPONSE_END;
}

/** A single streamed text fragment. Append to the in-progress response. */
interface AssistantResponseChunkEvent extends AISessionEventBase {
  type: AISessionEventType.ASSISTANT_RESPONSE_CHUNK;
  /** Partial text to append to the current response. */
  output: string;
}

/**
 * The assistant paused awaiting user confirmation.
 * Treat as the end of the current response stream.
 * Wire type is "ASSISTANT_PAUSED_RESPONSE".
 */
interface AssistantPausedEvent extends AISessionEventBase {
  type: AISessionEventType.ASSISTANT_PAUSED;
  response: {
    /** Partial output produced before pausing. */
    output: string | null;
    /** The confirmations the user must respond to before execution continues. */
    confirmationRequests?: ConfirmationRequest[];
  };
  duration?: number;
}

/** The assistant resumed after a pause. */
interface AssistantResumedEvent extends AISessionEventBase {
  type: AISessionEventType.ASSISTANT_RESUMED;
  request: {
    sessionId: string;
    sourceRequestId: string;
    batchConfirmationId: string;
  };
}

/** The assistant is about to invoke a tool — communicates intent before starting. */
interface ActionPromptEvent extends AISessionEventBase {
  type: AISessionEventType.ACTION_PROMPT;
  /** The tool about to be invoked. */
  tool: string;
  /** Inputs that will be passed to the tool. */
  inputs: Record<string, ActionIO>;
}

/** A formal action invocation request has been issued. */
interface ActionRequestEvent extends AISessionEventBase {
  type: AISessionEventType.ACTION_REQUEST;
  request: {
    tool: string;
    inputs: ActionIO[];
  };
}

/** An action started executing. */
interface ActionStartedEvent extends AISessionEventBase {
  type: AISessionEventType.ACTION_STARTED;
  tool: string;
  inputs: Record<string, ActionIO>;
  /** High-level category of this action (e.g. DATASET_LOOKUP, SQL_GENERATION). */
  actionType: string;
}

/** An action finished executing. */
interface ActionCompletedEvent extends AISessionEventBase {
  type: AISessionEventType.ACTION_COMPLETED;
  tool: string;
  outputs: ActionIO[];
  actionType: string;
  durationMs?: number;
  /** Source data references (dataset IDs, card IDs, etc.) used to produce the output. */
  sourceReferences: string[];
}

/** A request was sent to an underlying AI service (e.g. an LLM). */
interface AIServiceRequestEvent extends AISessionEventBase {
  type: AISessionEventType.AI_SERVICE_REQUEST;
  service: string;
  serviceRequest: unknown;
}

/** A response was received from an underlying AI service. */
interface AIServiceResponseEvent extends AISessionEventBase {
  type: AISessionEventType.AI_SERVICE_RESPONSE;
  service: string;
  serviceResponse: unknown;
  durationMs?: number;
}

/** A streamed chunk from a card/chart-generating action. */
interface ActionCardChunkEvent extends AISessionEventBase {
  type: AISessionEventType.CARD_ACTION_RESPONSE_CHUNK;
  tool: string;
  /** Text fragment of the card output. */
  output: string;
  actionType: string;
  /** Structured chart row data if this chunk carries chart content. */
  aiChartRow?: AIChartRow;
  /** True if this chunk is a header row rather than a data row. */
  isHeader: boolean;
}

/** An intermediate AI-generated insight produced during action execution. */
interface AIInsightEvent extends AISessionEventBase {
  type: AISessionEventType.AI_INSIGHT;
  tool: string;
  output: unknown;
  aiInsightType: AIInsight;
  actionType: string;
}

/** A non-fatal warning — may be displayed to the user. */
interface AIWarningEvent extends AISessionEventBase {
  type: AISessionEventType.AI_WARNING;
  output: unknown;
  aiWarningEventType: AIWarningEventType;
}

/** A timing measurement for a specific step — useful for debug/perf display. */
interface AIDurationEvent extends AISessionEventBase {
  type: AISessionEventType.AI_DURATION;
  /** Label identifying what was measured. */
  description: string;
  /** Duration in milliseconds. */
  duration: number;
}

/** Keep-alive ping during long-running operations. No display content. */
interface AIHeartbeatEvent extends AISessionEventBase {
  type: AISessionEventType.AI_HEARTBEAT;
}

/** One or more in-flight operations were cancelled. Wire type is "CANCEL". */
interface CancelEvent extends AISessionEventBase {
  type: AISessionEventType.AI_CANCEL;
  tool: string;
  cancelRequests: Array<{
    eventId: string;
    aiSessionEventType: AISessionEventType;
  }>;
  actionType: string;
  durationMs?: number;
}

/** A low-level tool call started. */
interface ToolStartedEvent extends AISessionEventBase {
  type: AISessionEventType.TOOL_STARTED;
  tool: string;
  arguments: Record<string, unknown>;
}

/** A low-level tool call finished. */
interface ToolCompletedEvent extends AISessionEventBase {
  type: AISessionEventType.TOOL_COMPLETED | AISessionEventType.TOOL_FINISHED;
  tool: string;
  response: ActionIO;
  actionType: string;
  durationMs?: number;
  sourceReferences?: string[];
}

/** A tool paused — the user must confirm before it can continue. */
interface ToolPausedEvent extends AISessionEventBase {
  type: AISessionEventType.TOOL_PAUSED;
  tool: string;
  /** The confirmations the user must respond to. */
  confirmationRequests: ConfirmationRequest[];
  durationMs?: number;
}

/** A paused tool was unblocked with a user response. */
interface ToolResumedEvent extends AISessionEventBase {
  type: AISessionEventType.TOOL_RESUMED;
  tool: string;
  /** eventId of the corresponding TOOL_PAUSED event. */
  pausedEventId: string;
  confirmationResponse: unknown;
}

/** A file was generated as output from an action. */
interface FileGeneratedEvent extends AISessionEventBase {
  type: AISessionEventType.FILE_GENERATED;
  response: ActionIO;
}

/** A raw MCP JSON-RPC request was sent or received. */
interface McpRequestEvent extends AISessionEventBase {
  type: AISessionEventType.MCP_REQUEST;
  direction: McpMessageDirection;
  payload: McpRequestPayload;
}

/** A raw MCP JSON-RPC response was sent or received. */
interface McpResponseEvent extends AISessionEventBase {
  type: AISessionEventType.MCP_RESPONSE;
  direction: McpMessageDirection;
  payload: McpResponsePayload;
}

/** A raw MCP JSON-RPC notification was sent or received. */
interface McpNotificationEvent extends AISessionEventBase {
  type: AISessionEventType.MCP_NOTIFICATION;
  direction: McpMessageDirection;
  payload: McpNotificationPayload;
}

/** The system is asking the user for approval or input before proceeding. */
interface RequestConfirmationEvent extends AISessionEventBase {
  type: AISessionEventType.CONFIRMATION_REQUEST;
  request: ConfirmationRequest;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type AISessionEvent =
  | AssistantRequestEvent
  | AssistantResponseEvent
  | AssistantResponseStartEvent
  | AssistantResponseEndEvent
  | AssistantResponseChunkEvent
  | AssistantPausedEvent
  | AssistantResumedEvent
  | ActionPromptEvent
  | ActionRequestEvent
  | ActionStartedEvent
  | ActionCompletedEvent
  | AIServiceRequestEvent
  | AIServiceResponseEvent
  | ActionCardChunkEvent
  | AIInsightEvent
  | AIWarningEvent
  | AIDurationEvent
  | AIHeartbeatEvent
  | CancelEvent
  | ToolStartedEvent
  | ToolCompletedEvent
  | ToolPausedEvent
  | ToolResumedEvent
  | FileGeneratedEvent
  | McpRequestEvent
  | McpResponseEvent
  | McpNotificationEvent
  | RequestConfirmationEvent;
