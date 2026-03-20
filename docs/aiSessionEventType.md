# AISessionEventType Definitions

Here are definitions for each AISessionEventType value, based on the enum and its corresponding event classes and usages.

## Assistant Lifecycle

| Type                     | Definition                                                                                                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ASSISTANT_REQUEST        | A user or system has submitted a request to the AI assistant. Carries a TextAssistantRequest with the prompt/input. Stored in chat history as the user turn.                                                                                               |
| ASSISTANT_RESPONSE       | The assistant has produced a complete response. Carries the full AIAssistantResponse and total duration. Stored in chat history as the assistant turn. This is the terminal event for a successful assistant exchange.                                     |
| ASSISTANT_RESPONSE_START | Signals that the assistant has begun generating a response (no payload beyond base fields). Used to notify clients that streaming output is about to begin.                                                                                                |
| ASSISTANT_RESPONSE_END   | Signals that the assistant has finished generating a response (no payload beyond base fields). Bookends ASSISTANT_RESPONSE_START.                                                                                                                          |
| ASSISTANT_RESPONSE_CHUNK | A single streaming chunk of the assistant's text output. Carries a String output fragment. Excluded from persistent session history (filtered out by MongoSessionHistoryService).                                                                          |
| ASSISTANT_PAUSED         | The assistant has paused mid-response, awaiting external input (e.g., tool confirmation). Carries a partial AIAssistantResponse and elapsed duration. Treated the same as ASSISTANT_RESPONSE in stream management — it closes the current response stream. |
| ASSISTANT_RESUMED        | The assistant has resumed execution after being paused. Carries an AgentResumeRequest describing how execution should continue.                                                                                                                            |

## Action Lifecycle

Actions are agent-level operations (tool calls) the assistant decides to execute. They have their own sub-lifecycle distinct from MCP tools.

| Type             | Definition                                                                                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ACTION_PROMPT    | The assistant is about to invoke a tool/action and is communicating its intent. Carries the tool name and inputs map. Marked with a TODO for localizable messaging — intended as a human-readable description of what is about to happen.      |
| ACTION_REQUEST   | A formal request to execute an action has been issued. Carries an AIActionRequest. Sits between the prompt (intent) and started (execution).                                                                                                   |
| ACTION_STARTED   | An action/tool has begun executing. Carries tool name, inputs, and ActionType. Stored in chat history (via ASSISTANT_ACTION_EVENT_FILTER). Also used by McpEventAdapter as a signal to adapt action events to MCP protocol messages.           |
| ACTION_COMPLETED | An action/tool has finished executing. Carries tool name, outputs, ActionType, durationMs, and optional sourceReferences. Stored in chat history alongside ACTION_STARTED. Also used to extract follow-up questions (FollowUpQuestionService). |

## AI Service Layer

These events wrap the lower-level calls to individual AI services (LLMs, embedding models, etc.).

| Type                | Definition                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI_SERVICE_REQUEST  | A request is being sent to a specific AIService (e.g., a text generation model). Generic — carries the typed serviceRequest. Used to build chat history scoped to a particular service via AI_SERVICE_EVENT_FILTER. |
| AI_SERVICE_RESPONSE | A response has been received from a specific AIService. Generic — carries the typed serviceResponse and durationMs. Paired with AI_SERVICE_REQUEST for chat history reconstruction.                                 |

## Card / Insight

| Type                       | Definition                                                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CARD_ACTION_RESPONSE_CHUNK | A streaming chunk of output from a card-related action (e.g., a chart or data visualization being generated). Carries tool, output text, AIChartRow data, and an isHeader flag.                 |
| AI_INSIGHT                 | An AI-generated insight produced during action execution. Generic — carries tool, typed output, an AIInsight type classifier, and ActionType. Used to surface intermediate analytical findings. |

## Diagnostics / Control

| Type         | Definition                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI_WARNING   | A non-fatal warning condition during AI processing. Generic — carries typed output and an AIWarningEventType classifier to categorize the warning.                                |
| AI_DURATION  | A timing/profiling event. Carries a description label and duration in milliseconds. Used for observability and performance tracking within a session.                             |
| AI_HEARTBEAT | A keep-alive signal with no payload beyond base fields. Emitted periodically during long-running operations to prevent client timeouts. Excluded from persistent session history. |
| AI_CANCEL    | Signals that one or more in-progress operations should be cancelled. Carries tool, a list of CancelEventRequest items, ActionType, and durationMs.                                |

## Tool Lifecycle (MCP / Low-level)

These events are for lower-level tool execution, distinct from the higher-level Action events. TOOL_STARTED and TOOL_COMPLETED are stored in chat history via TOOL_EVENT_FILTER.

| Type           | Definition                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TOOL_STARTED   | A tool call has begun. Carries tool name and a raw Map<String, Object> arguments. Used at the MCP/tool-execution layer below the action abstraction.                |
| TOOL_COMPLETED | A tool call has finished. Carries tool, a typed ActionIO<?> response, ActionType, durationMs, and sourceReferences.                                                 |
| TOOL_PAUSED    | A tool's execution has been suspended pending user confirmation. Carries tool, a list of ConfirmationRequest items, and durationMs.                                 |
| TOOL_RESUMED   | A paused tool has been unblocked. Carries tool, the pausedEventId linking back to the TOOL_PAUSED event, and the ConfirmationItemResponse with the user's decision. |

## File Output

| Type           | Definition                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| FILE_GENERATED | A file has been produced as output from an action or tool. Carries an ActionIO<?> response referencing the generated file artifact. |

## MCP Protocol

These three events represent raw Model Context Protocol JSON-RPC message traffic on the session event bus.

| Type             | Definition                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| MCP_REQUEST      | A JSON-RPC request message in the MCP protocol. Carries McpMessageDirection (inbound/outbound) and the raw McpJsonRpcPayload. |
| MCP_RESPONSE     | A JSON-RPC response message in the MCP protocol. Same shape as MCP_REQUEST.                                                   |
| MCP_NOTIFICATION | A JSON-RPC notification (fire-and-forget, no response expected) in the MCP protocol. Same shape as MCP_REQUEST.               |

## Confirmation / Human-in-the-Loop

| Type                 | Definition                                                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CONFIRMATION_REQUEST | The system is requesting explicit user confirmation before proceeding. Carries a ConfirmationRequest with the details of what needs approval. Related to TOOL_PAUSED — the tool pause triggers this, and a TOOL_RESUMED / ASSISTANT_RESUMED follows the user's answer. |

## Fallback

| Type    | Definition                                                                                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UNKNOWN | A sentinel value returned by valueOfType() when an unrecognized type string is deserialized. Prevents crashes in forward-compatibility scenarios where a newer event type is received by older code. |
