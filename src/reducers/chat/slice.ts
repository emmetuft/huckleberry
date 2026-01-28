import { Message } from 'models/interfaces/message';
import { createAppSlice } from '../createAppSlice';
import { sendRequest } from './actions';

interface State {
  messages: Message[];
  fullScreen: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  messages: [],
  fullScreen: false,
  loading: false,
  error: null,
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
  }),
  extraReducers: (builder) => {
    builder
      // Send request
      .addCase(sendRequest.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        // Add user message to the thread
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: action.meta.arg.userInput,
          timestamp: Date.now(),
        };
        state.messages.push(userMessage);
      })
      .addCase(sendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send request';
      })
      .addCase(sendRequest.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;

        // Add assistant message to the thread
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: payload.output,
          timestamp: Date.now(),
          context: payload.context,
        };
        state.messages.push(assistantMessage);
      });
  },
  selectors: {
    selectMessages: (state: State) => state.messages,
    selectHasMessages: (state: State) => state.messages.length > 0,
    selectFullScreen: (state: State) => state.fullScreen,
    selectLoading: (state: State) => state.loading,
    selectError: (state: State) => state.error,
  },
});

export const { setFullScreen, clearMessages } = ChatSlice.actions;

export const {
  selectMessages,
  selectHasMessages,
  selectFullScreen,
  selectLoading,
  selectError,
} = ChatSlice.selectors;

export default ChatSlice.reducer;
