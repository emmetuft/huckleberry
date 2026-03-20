import {
  AISessionEventType,
  type AISessionEvent,
} from 'models/interfaces/sessionEvent';
import {
  ProcessStep,
  ProcessStepStatus,
  ProcessStepType,
} from 'models/interfaces/processStep';

/**
 * Creates a ProcessStep from an ACTION_STARTED event
 */
export function createActionStep(event: AISessionEvent): ProcessStep {
  if (event.type !== AISessionEventType.ACTION_STARTED) {
    throw new Error('Expected ACTION_STARTED event');
  }

  return {
    id: event.eventId,
    stepType: ProcessStepType.ACTION,
    status: ProcessStepStatus.STARTED,
    title: `Action: ${event.tool}`,
    startEvent: event,
    tool: event.tool,
    actionType: event.actionType,
    inputs: event.inputs,
    startTime: event.timestamp,
  };
}

/**
 * Creates a ProcessStep from a TOOL_STARTED event
 */
export function createToolStep(event: AISessionEvent): ProcessStep {
  if (event.type !== AISessionEventType.TOOL_STARTED) {
    throw new Error('Expected TOOL_STARTED event');
  }

  return {
    id: event.eventId,
    stepType: ProcessStepType.TOOL,
    status: ProcessStepStatus.STARTED,
    title: `Tool: ${event.tool}`,
    startEvent: event,
    tool: event.tool,
    inputs: event.arguments,
    startTime: event.timestamp,
  };
}

/**
 * Creates a ProcessStep from an MCP_REQUEST event
 */
export function createMcpStep(event: AISessionEvent): ProcessStep {
  if (event.type !== AISessionEventType.MCP_REQUEST) {
    throw new Error('Expected MCP_REQUEST event');
  }

  const method = event.payload.method;
  return {
    id: event.eventId,
    stepType: ProcessStepType.MCP,
    status: ProcessStepStatus.STARTED,
    title: `MCP: ${method}`,
    description: event.direction,
    startEvent: event,
    mcpData: {
      method,
      direction: event.direction,
      requestPayload: event.payload,
    },
    startTime: event.timestamp,
  };
}

/**
 * Updates a ProcessStep with completion data from ACTION_COMPLETED or TOOL_COMPLETED
 */
export function updateStepWithCompletion(
  step: ProcessStep,
  event: AISessionEvent,
): ProcessStep {
  if (
    event.type !== AISessionEventType.ACTION_COMPLETED &&
    event.type !== AISessionEventType.TOOL_COMPLETED
  ) {
    throw new Error('Expected ACTION_COMPLETED or TOOL_COMPLETED event');
  }

  return {
    ...step,
    status: ProcessStepStatus.COMPLETED,
    endEvent: event,
    outputs:
      event.type === AISessionEventType.ACTION_COMPLETED
        ? event.outputs
        : [event.response],
    durationMs: event.durationMs,
    endTime: event.timestamp,
    error: event.error,
  };
}

/**
 * Updates a ProcessStep with MCP response data
 */
export function updateMcpStepWithResponse(
  step: ProcessStep,
  event: AISessionEvent,
): ProcessStep {
  if (event.type !== AISessionEventType.MCP_RESPONSE) {
    throw new Error('Expected MCP_RESPONSE event');
  }

  return {
    ...step,
    status: ProcessStepStatus.COMPLETED,
    endEvent: event,
    endTime: event.timestamp,
    mcpData: {
      ...step.mcpData!,
      responsePayload: event.payload,
    },
  };
}

/**
 * Updates a ProcessStep status (for pause/resume)
 */
export function updateStepStatus(
  step: ProcessStep,
  status: ProcessStepStatus,
  event?: AISessionEvent,
): ProcessStep {
  return {
    ...step,
    status,
    endEvent: event || step.endEvent,
    endTime: event?.timestamp || step.endTime,
  };
}
