// Domain constants for the Mako session event graph (ai-assistant-app/sessionGraph/).
// Use these when building Cypher queries via GraphService.cypherSearch().

export enum SessionGraphNodeLabel {
  Session = 'Session',
  Request = 'Request',
  ToolCall = 'ToolCall',
  ActionExecution = 'ActionExecution',
  Generation = 'Generation',
  ThinkingStep = 'ThinkingStep',
  McpExchange = 'MCP_EXCHANGE',
  // Context nodes
  Dataset = 'Dataset',
  Card = 'Card',
  Page = 'Page',
  FileSet = 'FileSet',
  App = 'App',
}

export enum SessionGraphRelationshipType {
  HasRequest = 'HAS_REQUEST', // Session → Request
  MadeToolCall = 'MADE_TOOL_CALL', // Request → ToolCall
  RanAction = 'RAN_ACTION', // ToolCall → ActionExecution
  InvokedModel = 'INVOKED_MODEL', // Request → Generation
  HadThinking = 'HAD_THINKING',
  Exchanged = 'EXCHANGED', // Request → McpExchange
  InContextOf = 'IN_CONTEXT_OF',
  Referenced = 'REFERENCED',
  Planned = 'PLANNED',
}

// Property shapes per node type — matches what SessionGraphRecordingService writes.

export interface SessionNode {
  sessionId: string;
  lastEventAt: number; // epoch ms
}

export interface RequestNode {
  requestId: string;
  startedAt?: number;
  completedAt?: number;
  pausedAt?: number;
  resumedAt?: number;
  model?: string;
  inputPreview?: string;
  outputPreview?: string;
  durationMs?: number;
  errorCode?: string;
}

export interface GenerationNode {
  startedAt?: number;
  completedAt?: number;
  service?: string;
  model?: string;
  durationMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  errorCode?: string;
}

export interface ToolCallNode {
  toolName?: string;
  arguments?: string; // JSON string
  actionType?: string;
  startedAt?: number;
  completedAt?: number;
  pausedAt?: number;
  resumedAt?: number;
  durationMs?: number;
  errorCode?: string;
}

export interface ActionExecutionNode {
  actionType?: string;
  inputs?: string; // JSON string
  outputs?: string; // JSON string
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  errorCode?: string;
}

export interface McpExchangeNode {
  method?: string;
  requestedAt?: number;
  respondedAt?: number;
  notifiedAt?: number;
  error?: string; // JSON string
  direction?: string;
}
