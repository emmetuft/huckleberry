import { Message } from 'models/interfaces/message';
import { createAppSlice } from '../createAppSlice';
import { queryGraphRag } from './actions';

interface State {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  messages: [],
  loading: false,
  error: null,
};

export const GraphRagSlice = createAppSlice({
  name: 'graphRag',
  initialState,
  reducers: (create) => ({
    clearMessages: create.reducer((state) => {
      state.messages = [];
      state.error = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      // Query graph RAG
      .addCase(queryGraphRag.pending, (state, action) => {
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
      .addCase(queryGraphRag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to query graph RAG';
      })
      .addCase(queryGraphRag.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;

        // Add assistant message to the thread
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: payload.output,
          timestamp: Date.now(),
          response: payload,
        };
        state.messages.push(assistantMessage);
      });
  },
  selectors: {
    selectMessages: (state: State) => state.messages,
    selectLoading: (state: State) => state.loading,
    selectError: (state: State) => state.error,
  },
});

export const { clearMessages } = GraphRagSlice.actions;

export const { selectMessages, selectLoading, selectError } =
  GraphRagSlice.selectors;

export default GraphRagSlice.reducer;
