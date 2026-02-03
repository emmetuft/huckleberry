import { Message } from 'models/interfaces/message';
import { createAppSlice } from '../createAppSlice';
import { sendStreamingRequest } from './actions';
import { ProcessStep } from 'services/context';

export interface ProcessStepWithUI extends ProcessStep {
  isOpen: boolean;
}

interface State {
  messages: Message[];
  fullScreen: boolean;
  loading: boolean;
  error: string | null;
  streamStatus: string | null;
  streamingMessageId: string | null;
  processingSteps: ProcessStepWithUI[];
}

const initialState: State = {
  messages: [],
  fullScreen: false,
  loading: false,
  error: null,
  streamStatus: null,
  streamingMessageId: null,
  processingSteps: [],
};

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
    }),
    updateStreamStatus: create.reducer((state, action: { payload: string }) => {
      state.streamStatus = action.payload;
    }),
    appendStreamText: create.reducer((state, action: { payload: string }) => {
      // Find the streaming message and append text
      if (state.streamingMessageId) {
        const message = state.messages.find(
          (m) => m.id === state.streamingMessageId,
        );
        if (message) {
          message.content += action.payload;
        }
      }
    }),
    addProcessStep: create.reducer(
      (state, action: { payload: ProcessStep }) => {
        // Add new step to the streaming message
        if (state.streamingMessageId) {
          const message = state.messages.find(
            (m) => m.id === state.streamingMessageId,
          );
          if (message) {
            if (!message.processingSteps) {
              message.processingSteps = [];
            }
            message.processingSteps.push({
              ...action.payload,
              isOpen: true,
            });
          }
        }
      },
    ),
    updateProcessStep: create.reducer(
      (state, action: { payload: ProcessStep }) => {
        // Update step in the streaming message
        if (state.streamingMessageId) {
          const message = state.messages.find(
            (m) => m.id === state.streamingMessageId,
          );
          if (message?.processingSteps) {
            const index = message.processingSteps.findIndex(
              (s) => s.id === action.payload.id,
            );
            if (index !== -1) {
              // If this is the "generate-response" step completing, remove it entirely
              if (
                action.payload.id === 'generate-response' &&
                action.payload.status === 'complete'
              ) {
                message.processingSteps.splice(index, 1);
              } else {
                message.processingSteps[index] = {
                  ...message.processingSteps[index],
                  ...action.payload,
                };
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
          if (step) {
            step.isOpen = !step.isOpen;
          }
        }
      },
    ),
    collapseAllSteps: create.reducer((state, action: { payload: string }) => {
      // Collapse all steps in a specific message
      const message = state.messages.find((m) => m.id === action.payload);
      if (message?.processingSteps) {
        message.processingSteps.forEach((step) => {
          step.isOpen = false;
        });
      }
    }),
    clearProcessingSteps: create.reducer((state) => {
      state.processingSteps = [];
    }),
  }),
  extraReducers: (builder) => {
    builder
      // Send streaming request
      .addCase(sendStreamingRequest.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.streamStatus = null;
        state.processingSteps = []; // Clear previous steps

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
      .addCase(sendStreamingRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to send streaming request';
        state.streamStatus = null;
        state.streamingMessageId = null;
      })
      .addCase(sendStreamingRequest.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.streamStatus = null;

        // Update the assistant message with final context and collapse steps
        if (state.streamingMessageId) {
          const message = state.messages.find(
            (m) => m.id === state.streamingMessageId,
          );
          if (message) {
            if (payload.context) {
              message.context = payload.context;
            }
            // Collapse all processing steps when complete
            if (message.processingSteps) {
              message.processingSteps.forEach((step) => {
                step.isOpen = false;
              });
            }
          }
        }

        state.streamingMessageId = null;
      });
  },
  selectors: {
    selectMessages: (state: State) => state.messages,
    selectHasMessages: (state: State) => state.messages.length > 0,
    selectFullScreen: (state: State) => state.fullScreen,
    selectLoading: (state: State) => state.loading,
    selectError: (state: State) => state.error,
    selectStreamStatus: (state: State) => state.streamStatus,
    selectProcessingSteps: (state: State) => state.processingSteps,
  },
});

export const {
  setFullScreen,
  clearMessages,
  updateStreamStatus,
  appendStreamText,
  addProcessStep,
  updateProcessStep,
  toggleProcessStep,
  collapseAllSteps,
  clearProcessingSteps,
} = ChatSlice.actions;

export const {
  selectMessages,
  selectHasMessages,
  selectFullScreen,
  selectLoading,
  selectError,
  selectStreamStatus,
  selectProcessingSteps,
} = ChatSlice.selectors;

export default ChatSlice.reducer;
