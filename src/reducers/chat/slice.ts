import { createAppSlice } from '../createAppSlice';
import {
  deleteSession,
  executeStream,
  fetchSession,
  fetchSessions,
  resumeStream,
} from './actions';
import { Message } from 'models/interfaces/message';
import { sessionEventsToMessages } from 'utils/sessionMessages';
import {
  ProcessStep,
  ProcessStepStatus,
  ProcessStepType,
} from 'models/interfaces/processStep';
import { AgentSession } from 'models/interfaces/session';
import {
  AISessionEventType,
  ConfirmationRequest,
} from 'models/interfaces/sessionEvent';

interface State {
  sessions: AgentSession[];
  messages: Message[];
  fullScreen: boolean;
  loading: boolean;
  error: string | null;
  streamingMessageId: string | null;
  sessionId?: string;
}

const initialState: State = {
  sessions: [],
  messages: [],
  fullScreen: false,
  loading: false,
  error: null,
  streamingMessageId: null,
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Finds the currently streaming message in the state.
 * Returns undefined if no streaming message exists or if it can't be found.
 */
function getStreamingMessage(state: State): Message | undefined {
  if (!state.streamingMessageId) return undefined;
  return state.messages.find((m) => m.id === state.streamingMessageId);
}

/**
 * Handles the fulfilled state for streaming actions.
 * Updates the message content, collapses steps, and clears streaming state.
 * Only clears streamingMessageId if there are no pending confirmation requests.
 */
function handleStreamFulfilled(state: State, payload?: string) {
  state.loading = false;
  state.error = null;

  // Update the assistant message with final output and collapse steps
  const message = getStreamingMessage(state);
  if (message) {
    if (payload) {
      message.content = payload;
    }
    if (message.processingSteps) {
      message.processingSteps.forEach((step) => {
        step.isOpen = false;
      });
    }

    // Only clear streamingMessageId if there are no pending confirmation requests
    // If confirmations are pending, we're paused and will resume later
    if (
      !message.confirmationRequests ||
      message.confirmationRequests.length === 0
    ) {
      state.streamingMessageId = null;
    }
  } else {
    // If no message found, clear streamingMessageId anyway
    state.streamingMessageId = null;
  }
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const ChatSlice = createAppSlice({
  name: 'chat',
  initialState,
  reducers: (create) => ({
    setFullScreen: create.reducer((state, action: { payload: boolean }) => {
      state.fullScreen = action.payload;
    }),
    clearMessages: create.reducer((state) => {
      state.messages = [];
      state.error = null;
      state.sessionId = undefined;
    }),
    appendStreamText: create.reducer((state, action: { payload: string }) => {
      const message = getStreamingMessage(state);
      if (message) {
        message.content += action.payload;
      } else {
        console.warn('[slice/appendStreamText] no streamingMessageId set!');
      }
    }),
    addProcessStep: create.reducer(
      (state, action: { payload: ProcessStep }) => {
        const message = getStreamingMessage(state);
        if (message) {
          if (!message.processingSteps) {
            message.processingSteps = [];
          }
          message.processingSteps.push({
            ...action.payload,
            isOpen: true,
          });
        }
      },
    ),
    addActionSubStep: create.reducer(
      (state, action: { payload: ProcessStep }) => {
        const message = getStreamingMessage(state);
        if (message?.processingSteps) {
          const toolStep = message.processingSteps.find(
            (s) =>
              s.stepType === ProcessStepType.TOOL &&
              s.tool === action.payload.tool,
          );
          if (toolStep) {
            if (!toolStep.subSteps) toolStep.subSteps = [];
            toolStep.subSteps.push(action.payload);
          }
        }
      },
    ),
    updateProcessStep: create.reducer(
      (
        state,
        action: {
          payload: {
            eventId: string;
            event: any;
            status?: ProcessStepStatus;
          };
        },
      ) => {
        const message = getStreamingMessage(state);
        if (message?.processingSteps) {
          const applyUpdate = <T extends ProcessStep>(existingStep: T): T => {
            const event = action.payload.event;

            // Determine the new status
            let status: ProcessStepStatus | undefined = action.payload.status;
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

            const updatedStep = {
              ...existingStep,
              status: status || existingStep.status,
              endEvent: event,
              endTime: event.timestamp,
              durationMs: event.durationMs || existingStep.durationMs,
              error: event.error || existingStep.error,
            };

            if (event.type === AISessionEventType.ACTION_COMPLETED) {
              updatedStep.outputs = event.outputs;
            } else if (
              event.type === AISessionEventType.TOOL_COMPLETED ||
              event.type === AISessionEventType.TOOL_FINISHED
            ) {
              updatedStep.outputs = [event.response];
            }

            if (event.type === AISessionEventType.MCP_RESPONSE) {
              updatedStep.mcpData = {
                ...existingStep.mcpData,
                responsePayload: event.payload,
              } as any;
            }

            return updatedStep;
          };

          // Search top-level steps first
          const index = message.processingSteps.findIndex(
            (s) => s.id === action.payload.eventId,
          );
          if (index !== -1) {
            message.processingSteps[index] = applyUpdate(
              message.processingSteps[index],
            );
          } else {
            // Search sub-steps
            for (const parentStep of message.processingSteps) {
              if (parentStep.subSteps) {
                const subIndex = parentStep.subSteps.findIndex(
                  (s) => s.id === action.payload.eventId,
                );
                if (subIndex !== -1) {
                  parentStep.subSteps[subIndex] = applyUpdate(
                    parentStep.subSteps[subIndex],
                  );
                  break;
                }
              }
            }
          }
        }
      },
    ),
    toggleProcessStep: create.reducer(
      (state, action: { payload: { messageId: string; stepId: string } }) => {
        const message = state.messages.find(
          (m) => m.id === action.payload.messageId,
        );
        if (message?.processingSteps) {
          const step = message.processingSteps.find(
            (s) => s.id === action.payload.stepId,
          );
          if (step) step.isOpen = !step.isOpen;
        }
      },
    ),
    collapseAllSteps: create.reducer((state, action: { payload: string }) => {
      const message = state.messages.find((m) => m.id === action.payload);
      if (message?.processingSteps) {
        message.processingSteps.forEach((step) => {
          step.isOpen = false;
        });
      }
    }),
    addInsight: create.reducer((state, action: { payload: any }) => {
      const message = getStreamingMessage(state);
      if (message) {
        if (!message.insights) {
          message.insights = [];
        }
        message.insights.push({
          id: `insight-${Date.now()}`,
          content: action.payload,
          timestamp: Date.now(),
        });
      }
    }),
    addWarning: create.reducer((state, action: { payload: string }) => {
      const message = getStreamingMessage(state);
      if (message) {
        if (!message.warnings) {
          message.warnings = [];
        }
        message.warnings.push({
          id: `warning-${Date.now()}`,
          message: action.payload,
          timestamp: Date.now(),
        });
      }
    }),
    setConfirmationRequests: create.reducer(
      (state, action: { payload: ConfirmationRequest[] }) => {
        const message = getStreamingMessage(state);
        if (message) {
          message.confirmationRequests = action.payload;
        }
      },
    ),
    setSessionId: create.reducer((state, action: { payload: string }) => {
      state.sessionId = action.payload;
    }),
    updateMessageMetadata: create.reducer(
      (
        state,
        action: {
          payload: {
            sessionId?: string;
            eventId?: string;
            parentEventId?: string;
            requestId?: string;
            error?: any;
          };
        },
      ) => {
        const message = getStreamingMessage(state);
        if (message) {
          if (action.payload.sessionId)
            message.sessionId = action.payload.sessionId;
          if (action.payload.eventId) message.eventId = action.payload.eventId;
          if (action.payload.parentEventId)
            message.parentEventId = action.payload.parentEventId;
          if (action.payload.requestId)
            message.requestId = action.payload.requestId;
          if (action.payload.error) message.error = action.payload.error;
        }
      },
    ),
  }),
  extraReducers: (builder) => {
    builder
      // Fetch agent sessions
      .addCase(fetchSessions.fulfilled, (state, { payload }) => {
        state.sessions = payload;
      })
      // Load a saved session into the chat thread
      .addCase(fetchSession.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.messages = [];
        state.sessionId = undefined;
        state.streamingMessageId = null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load session';
      })
      .addCase(fetchSession.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sessionId = payload.id;
        state.messages = sessionEventsToMessages(payload.events ?? []);
        state.error = null;
        state.streamingMessageId = null;
        state.fullScreen = true;
      })
      .addCase(deleteSession.fulfilled, (state, { meta }) => {
        // Remove the deleted session from the sessions list
        const sessionId = meta.arg;
        state.sessions = state.sessions.filter((s) => s.id !== sessionId);

        // Clear the chat thread if the deleted session was currently loaded
        if (state.sessionId === sessionId) {
          state.messages = [];
          state.sessionId = undefined;
          state.streamingMessageId = null;
          state.error = null;
          state.fullScreen = false;
        }
      })

      // Send streaming request
      .addCase(executeStream.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        // Add user message to the thread
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: action.meta.arg.userInput,
          timestamp: Date.now(),
          files: action.meta.arg.files,
        };
        state.messages.push(userMessage);

        // Add empty assistant message that we'll update as stream comes in
        const assistantMessageId = `assistant-${Date.now()}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };
        state.messages.push(assistantMessage);
        state.streamingMessageId = assistantMessageId;
      })
      .addCase(executeStream.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to send streaming request';
        state.streamingMessageId = null;
      })
      .addCase(executeStream.fulfilled, (state, { payload }) => {
        handleStreamFulfilled(state, payload);
      })
      // Submit elicitation response (resume stream)
      .addCase(resumeStream.pending, (state) => {
        state.loading = true;
        state.error = null;

        // Clear confirmation requests from the streaming message
        const message = getStreamingMessage(state);
        if (message) {
          delete message.confirmationRequests;
        }
      })
      .addCase(resumeStream.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to submit elicitation response';
        state.streamingMessageId = null;
      })
      .addCase(resumeStream.fulfilled, (state, { payload }) => {
        handleStreamFulfilled(state, payload);
      });
  },
  selectors: {
    selectSessions: (state: State) => state.sessions,
    selectMessages: (state: State) => state.messages,
    selectHasMessages: (state: State) => state.messages.length > 0,
    selectFullScreen: (state: State) => state.fullScreen,
    selectLoading: (state: State) => state.loading,
    selectError: (state: State) => state.error,
    selectSessionId: (state: State) => state.sessionId,
  },
});

export const {
  setFullScreen,
  clearMessages,
  appendStreamText,
  addProcessStep,
  addActionSubStep,
  updateProcessStep,
  toggleProcessStep,
  collapseAllSteps,
  addInsight,
  addWarning,
  setConfirmationRequests,
  setSessionId,
  updateMessageMetadata,
} = ChatSlice.actions;

export const {
  selectSessions,
  selectMessages,
  selectHasMessages,
  selectFullScreen,
  selectLoading,
  selectError,
  selectSessionId,
} = ChatSlice.selectors;

export default ChatSlice.reducer;
