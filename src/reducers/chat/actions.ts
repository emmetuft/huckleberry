import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import {
  AISessionEventType,
  AISessionEvent,
} from 'models/interfaces/sessionEvent';
import { ProcessedFile } from 'models/interfaces/files';
import { MCPToolCall } from 'models/interfaces/mcpServer';
import {
  ElicitationResponse,
  ResumeRequest,
} from 'models/interfaces/userRequest';
import { AgentService } from 'services/agent';
import {
  createActionStep,
  createToolStep,
  createMcpStep,
} from 'utils/processStep';

/**
 * Shared handler for all stream events
 * Handles all events from both new streams and resumed streams
 * @param accumulator Optional object to accumulate text output for return value
 */
const handleStreamEvent = (
  event: AISessionEvent,
  dispatch: any,
  accumulator?: { text: string },
): void => {
  // Update message metadata from base event fields
  dispatch({
    type: 'chat/updateMessageMetadata',
    payload: {
      sessionId: event.sessionId,
      eventId: event.eventId,
      parentEventId: event.parentEventId,
      requestId: event.requestId,
      error: event.error,
    },
  });

  switch (event.type) {
    // Text Streaming
    case AISessionEventType.ASSISTANT_RESPONSE_CHUNK:
      if (event.output) {
        dispatch({
          type: 'chat/appendStreamText',
          payload: event.output,
        });
        // Accumulate text if accumulator provided
        if (accumulator) {
          accumulator.text += event.output;
        }
      }
      break;

    // Process Steps - track action execution
    case AISessionEventType.ACTION_STARTED: {
      const step = createActionStep(event);
      dispatch({
        type: 'chat/addActionSubStep',
        payload: step,
      });
      break;
    }

    case AISessionEventType.ACTION_COMPLETED: {
      dispatch({
        type: 'chat/updateProcessStep',
        payload: {
          eventId: event.parentEventId || event.eventId,
          event,
        },
      });
      break;
    }

    // Process Steps - track tool execution
    case AISessionEventType.TOOL_STARTED: {
      const step = createToolStep(event);
      dispatch({
        type: 'chat/addProcessStep',
        payload: step,
      });
      break;
    }

    case AISessionEventType.TOOL_COMPLETED:
    case AISessionEventType.TOOL_FINISHED:
      dispatch({
        type: 'chat/updateProcessStep',
        payload: {
          eventId: event.parentEventId || event.eventId,
          event,
        },
      });
      break;

    case AISessionEventType.TOOL_PAUSED:
      dispatch({
        type: 'chat/updateProcessStep',
        payload: {
          eventId: event.parentEventId || event.eventId,
          event,
          status: 'paused',
        },
      });
      break;

    case AISessionEventType.TOOL_RESUMED:
      dispatch({
        type: 'chat/updateProcessStep',
        payload: {
          eventId: event.pausedEventId,
          event,
          status: 'resumed',
        },
      });
      break;

    // MCP Protocol - track MCP calls
    case AISessionEventType.MCP_REQUEST: {
      const step = createMcpStep(event);
      dispatch({
        type: 'chat/addProcessStep',
        payload: step,
      });
      break;
    }

    case AISessionEventType.MCP_RESPONSE:
      dispatch({
        type: 'chat/updateProcessStep',
        payload: {
          eventId: event.parentEventId || event.eventId,
          event,
        },
      });
      break;

    // Lifecycle Events
    case AISessionEventType.ASSISTANT_RESPONSE_START:
      dispatch({
        type: 'chat/updateStreamStatus',
        payload: 'Streaming response...',
      });
      break;

    case AISessionEventType.ASSISTANT_RESPONSE_END:
      dispatch({
        type: 'chat/updateStreamStatus',
        payload: 'Response complete',
      });
      break;

    case AISessionEventType.ASSISTANT_PAUSED:
      dispatch({
        type: 'chat/updateStreamStatus',
        payload: 'Assistant paused - awaiting input',
      });
      if (event.response?.confirmationRequests) {
        dispatch({
          type: 'chat/setConfirmationRequests',
          payload: event.response.confirmationRequests,
        });
      }
      break;

    case AISessionEventType.ASSISTANT_RESUMED:
      dispatch({
        type: 'chat/updateStreamStatus',
        payload: 'Assistant resumed',
      });
      break;

    // Insights & Warnings
    case AISessionEventType.AI_INSIGHT:
      if (event.output) {
        dispatch({
          type: 'chat/addInsight',
          payload: event.output,
        });
      }
      break;

    case AISessionEventType.AI_WARNING:
      if (event.output) {
        dispatch({
          type: 'chat/addWarning',
          payload: event.output,
        });
      }
      break;

    // User Interaction
    case AISessionEventType.CONFIRMATION_REQUEST:
      if (event.request) {
        dispatch({
          type: 'chat/requestConfirmation',
          payload: event.request,
        });
      }
      break;

    // Terminal Event
    case AISessionEventType.ASSISTANT_RESPONSE:
      // This event contains the final response but doesn't require UI updates
      // The text has already been streamed via ASSISTANT_RESPONSE_CHUNK events
      // Set final text in accumulator if provided
      if (accumulator && event.response) {
        accumulator.text = event.response.output || accumulator.text;
      }
      break;

    default:
      // Unhandled event type
      break;
  }
};

/**
 * Send a streaming request to the huckleberry agent
 */
export const sendStreamingRequest = createAsyncThunk<
  string,
  {
    userInput: string;
    files?: ProcessedFile[];
    tools?: MCPToolCall[];
    dataSources?: any;
  },
  { state: RootState }
>('chat/sendStreamingRequest', async (params, { getState, dispatch }) => {
  const { sessionId } = getState().chat;
  const accumulator = { text: '' };

  // Store the aiAssistantContext for potential resume operations
  if (params.dataSources) {
    dispatch({
      type: 'chat/updateResumeContext',
      payload: {
        aiAssistantContext: {
          dataSourceIds: params.dataSources,
        },
      },
    });
  }

  for await (const message of AgentService.queryStream(params, sessionId)) {
    // Capture sessionId from the first event
    if (!sessionId && message.sessionId) {
      dispatch({
        type: 'chat/setSessionId',
        payload: message.sessionId,
      });
    }

    handleStreamEvent(message, dispatch, accumulator);
  }

  return accumulator.text;
});

/**
 * Submit an elicitation response
 */
export const submitElicitationResponse = createAsyncThunk<
  string,
  {
    batchId?: string;
    requestId: string;
    responses: Array<ElicitationResponse>;
  },
  { state: RootState }
>(
  'chat/submitElicitationResponse',
  async ({ batchId, requestId, responses }, { getState, dispatch }) => {
    const { sessionId, messages } = getState().chat;
    const accumulator = { text: '' };

    if (!sessionId || !batchId) {
      throw new Error('Session ID or batch ID missing');
    }

    const params: ResumeRequest = {
      batchId,
      sourceRequestId: requestId,
      aiAssistantContext: {},
      responseItems: responses,
    };

    for await (const event of AgentService.submitElicitationResponse(
      params,
      sessionId,
    )) {
      handleStreamEvent(event, dispatch, accumulator);
    }

    return accumulator.text;
  },
);
