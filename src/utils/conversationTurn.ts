import {
  AIInsight,
  AIWarning,
  AssistantTurn,
  TurnType,
  UserTurn,
} from 'models/interfaces/message';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import {
  ProcessStepStatus,
  ProcessStepType,
  ProcessStepWithUI,
} from 'models/interfaces/processStep';
import { ProcessedFile } from 'models/interfaces/files';
import {
  createActionStep,
  createToolStep,
  createMcpStep,
} from 'utils/processStep';

// ─── Factories ────────────────────────────────────────────────────────────────

export function createUserTurn(
  content: string,
  files?: ProcessedFile[],
  dataSourceIds?: string[],
): UserTurn {
  const now = Date.now();
  return {
    kind: TurnType.USER,
    id: `user-${now}`,
    timestamp: now,
    event: null,
    content,
    files,
    context: dataSourceIds?.length ? { dataSourceIds } : undefined,
  };
}

export function createAssistantTurn(): AssistantTurn {
  const now = Date.now();
  return {
    kind: TurnType.ASSISTANT,
    id: `assistant-${now}`,
    timestamp: now,
    event: null,
    requestId: null,
    content: '',
    processingSteps: [],
    insights: [],
    warnings: [],
  };
}

// ─── Step Helpers ─────────────────────────────────────────────────────────────

function buildUpdatedStep(
  step: any,
  event: AISessionEvent,
  statusOverride?: ProcessStepStatus,
): any {
  let status: ProcessStepStatus | undefined = statusOverride;
  if (!status) {
    if (
      event.type === AISessionEventType.ACTION_COMPLETED ||
      event.type === AISessionEventType.TOOL_COMPLETED ||
      event.type === AISessionEventType.TOOL_FINISHED ||
      event.type === AISessionEventType.MCP_RESPONSE
    ) {
      status = ProcessStepStatus.COMPLETED;
    } else if (event.type === AISessionEventType.TOOL_PAUSED) {
      status = ProcessStepStatus.PAUSED;
    } else if (event.type === AISessionEventType.TOOL_RESUMED) {
      status = ProcessStepStatus.RESUMED;
    }
  }
  if (event.error) {
    status = ProcessStepStatus.FAILED;
  }

  const updated = {
    ...step,
    status: status ?? step.status,
    endEvent: event,
    endTime: (event as any).timestamp,
    durationMs: (event as any).durationMs ?? step.durationMs,
    error: event.error ?? step.error,
  };

  if (event.type === AISessionEventType.ACTION_COMPLETED) {
    updated.outputs = event.outputs;
  } else if (
    event.type === AISessionEventType.TOOL_COMPLETED ||
    event.type === AISessionEventType.TOOL_FINISHED
  ) {
    updated.outputs = [event.response];
  } else if (event.type === AISessionEventType.MCP_RESPONSE) {
    updated.mcpData = { ...step.mcpData, responsePayload: event.payload };
  }

  return updated;
}

function updateStepInList(
  steps: ProcessStepWithUI[],
  eventId: string,
  event: AISessionEvent,
  statusOverride?: ProcessStepStatus,
): ProcessStepWithUI[] {
  const index = steps.findIndex((s) => s.id === eventId);
  if (index !== -1) {
    const updated = [...steps];
    updated[index] = buildUpdatedStep(steps[index], event, statusOverride);
    return updated;
  }

  // Search sub-steps
  for (let i = 0; i < steps.length; i++) {
    const parent = steps[i];
    if (!parent.subSteps) continue;
    const subIndex = parent.subSteps.findIndex((s) => s.id === eventId);
    if (subIndex !== -1) {
      const newSubSteps = [...parent.subSteps];
      newSubSteps[subIndex] = buildUpdatedStep(
        parent.subSteps[subIndex],
        event,
        statusOverride,
      );
      const updated = [...steps];
      updated[i] = { ...parent, subSteps: newSubSteps };
      return updated;
    }
  }

  return steps;
}

// ─── Core Utility ─────────────────────────────────────────────────────────────

/**
 * Applies a single stream event to an AssistantTurn and returns the updated turn.
 * Pure function — safe to use in both Redux reducers and session replay.
 *
 * Covers all event types handled by handleStreamEvent in actions.ts:
 * text streaming, process steps (tools, actions, MCP), insights, warnings,
 * and pending confirmation requests.
 */
export function applyEventToTurn(
  turn: AssistantTurn,
  event: AISessionEvent,
): AssistantTurn {
  // Always update requestId from the first event that carries one
  const base: AssistantTurn = {
    ...turn,
    requestId: turn.requestId ?? event.requestId,
  };

  switch (event.type) {
    // ── Text streaming ──────────────────────────────────────────────────────
    case AISessionEventType.ASSISTANT_RESPONSE_CHUNK:
      if (!event.output) return base;
      return { ...base, content: base.content + event.output };

    // ── Terminal events — set the final event and content ───────────────────
    case AISessionEventType.ASSISTANT_RESPONSE:
      return {
        ...base,
        event,
        content: event.response.output ?? base.content,
        confirmationRequests: undefined,
      };

    case AISessionEventType.ASSISTANT_RESUMED:
      return {
        ...base,
        confirmationRequests: undefined,
      };

    case AISessionEventType.ASSISTANT_PAUSED:
      return {
        ...base,
        event,
        content: event.response.output ?? base.content,
        confirmationRequests:
          event.response.confirmationRequests ?? base.confirmationRequests,
      };

    // ── Tool execution ──────────────────────────────────────────────────────
    case AISessionEventType.TOOL_STARTED: {
      const step = createToolStep(event);
      return {
        ...base,
        processingSteps: [...base.processingSteps, { ...step, isOpen: true }],
      };
    }

    case AISessionEventType.TOOL_COMPLETED:
    case AISessionEventType.TOOL_FINISHED:
      return {
        ...base,
        processingSteps: updateStepInList(
          base.processingSteps,
          event.parentEventId || event.eventId,
          event,
        ),
      };

    case AISessionEventType.TOOL_PAUSED:
      return {
        ...base,
        processingSteps: updateStepInList(
          base.processingSteps,
          event.parentEventId || event.eventId,
          event,
          ProcessStepStatus.PAUSED,
        ),
      };

    case AISessionEventType.TOOL_RESUMED:
      return {
        ...base,
        processingSteps: updateStepInList(
          base.processingSteps,
          event.pausedEventId,
          event,
          ProcessStepStatus.RESUMED,
        ),
      };

    // ── Action execution ────────────────────────────────────────────────────
    case AISessionEventType.ACTION_STARTED: {
      const step = createActionStep(event);
      const parentIndex = base.processingSteps.findIndex(
        (s) => s.toolCallId && s.toolCallId === event.toolCallId,
      );
      if (parentIndex !== -1) {
        const updated = [...base.processingSteps];
        const parent = updated[parentIndex];
        updated[parentIndex] = {
          ...parent,
          subSteps: [...(parent.subSteps ?? []), step],
        };
        return { ...base, processingSteps: updated };
      }
      return {
        ...base,
        processingSteps: [...base.processingSteps, { ...step, isOpen: true }],
      };
    }

    case AISessionEventType.ACTION_COMPLETED:
      return {
        ...base,
        processingSteps: updateStepInList(
          base.processingSteps,
          event.parentEventId || event.eventId,
          event,
        ),
      };

    // ── MCP protocol ────────────────────────────────────────────────────────
    case AISessionEventType.MCP_REQUEST: {
      const step = createMcpStep(event);
      return {
        ...base,
        processingSteps: [...base.processingSteps, { ...step, isOpen: true }],
      };
    }

    case AISessionEventType.MCP_RESPONSE:
      return {
        ...base,
        processingSteps: updateStepInList(
          base.processingSteps,
          event.parentEventId || event.eventId,
          event,
        ),
      };

    // ── Insights & warnings ─────────────────────────────────────────────────
    case AISessionEventType.AI_INSIGHT: {
      if (!event.output) return base;
      const insight: AIInsight = {
        id: event.eventId,
        content: String(event.output),
        timestamp: new Date(event.timestamp).getTime(),
      };
      return { ...base, insights: [...base.insights, insight] };
    }

    case AISessionEventType.AI_WARNING: {
      if (!event.output) return base;
      const warning: AIWarning = {
        id: event.eventId,
        message: String(event.output),
        timestamp: new Date(event.timestamp).getTime(),
      };
      return { ...base, warnings: [...base.warnings, warning] };
    }

    default:
      return base;
  }
}
