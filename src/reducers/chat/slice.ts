import { createAppSlice } from '../createAppSlice';
import {
  deleteSession,
  executeStream,
  fetchDataSources,
  fetchSession,
  fetchSessions,
  resumeStream,
} from './actions';
import {
  AssistantTurn,
  ConversationTurn,
  TurnType,
  UserTurn,
} from 'models/interfaces/message';
import { sessionEventsToMessages } from 'utils/sessionMessages';
import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import {
  applyEventToTurn,
  createAssistantTurn,
  createUserTurn,
} from 'utils/conversationTurn';

interface State {
  sessions: AgentSession[];
  turns: ConversationTurn[];
  dataSources: Record<string, any>;
  loading: boolean;
  error: string | null;
  streamingTurnId: string | null;
  sessionId?: string;
}

const initialState: State = {
  sessions: [],
  turns: [],
  dataSources: {},
  loading: false,
  error: null,
  streamingTurnId: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStreamingTurn(state: State): AssistantTurn | undefined {
  if (!state.streamingTurnId) return undefined;
  const turn = state.turns.find((t) => t.id === state.streamingTurnId);
  return turn?.kind === TurnType.ASSISTANT ? turn : undefined;
}

function handleStreamFulfilled(state: State) {
  state.loading = false;
  state.error = null;

  const turn = getStreamingTurn(state);
  if (turn) {
    // Collapse all process steps now that streaming is done
    turn.processingSteps.forEach((step) => {
      step.isOpen = false;
    });
    // Keep streamingTurnId set if the session is paused awaiting user input
    if (!turn.confirmationRequests?.length) {
      state.streamingTurnId = null;
    }
  } else {
    state.streamingTurnId = null;
  }
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const ChatSlice = createAppSlice({
  name: 'chat',
  initialState,
  reducers: (create) => ({
    clearMessages: create.reducer((state) => {
      state.turns = [];
      state.error = null;
      state.sessionId = undefined;
      state.streamingTurnId = null;
    }),
    applyStreamEvent: create.reducer(
      (state, action: { payload: AISessionEvent }) => {
        const index = state.turns.findIndex(
          (t) => t.id === state.streamingTurnId,
        );
        if (index === -1) return;
        const turn = state.turns[index];
        if (turn.kind !== TurnType.ASSISTANT) return;
        state.turns[index] = applyEventToTurn(turn, action.payload);
      },
    ),
    toggleProcessStep: create.reducer(
      (state, action: { payload: { turnId: string; stepId: string } }) => {
        const turn = state.turns.find(
          (t) =>
            t.kind === TurnType.ASSISTANT && t.id === action.payload.turnId,
        ) as AssistantTurn | undefined;
        if (turn?.processingSteps) {
          const step = turn.processingSteps.find(
            (s) => s.id === action.payload.stepId,
          );
          if (step) step.isOpen = !step.isOpen;
        }
      },
    ),
    setSessionId: create.reducer((state, action: { payload: string }) => {
      state.sessionId = action.payload;
    }),
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
        state.turns = [];
        state.sessionId = undefined;
        state.streamingTurnId = null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load session';
      })
      .addCase(fetchSession.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sessionId = payload.id;
        state.turns = sessionEventsToMessages(payload.events ?? []);
        state.error = null;
        state.streamingTurnId = null;
      })
      // Delete agent session
      .addCase(deleteSession.fulfilled, (state, { meta }) => {
        const sessionId = meta.arg;
        state.sessions = state.sessions.filter((s) => s.id !== sessionId);
        if (state.sessionId === sessionId) {
          state.turns = [];
          state.sessionId = undefined;
          state.streamingTurnId = null;
          state.error = null;
        }
      })
      // Send streaming request
      .addCase(executeStream.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const userTurn: UserTurn = createUserTurn(
          action.meta.arg.userInput,
          action.meta.arg.files,
          action.meta.arg.dataSources,
        );
        state.turns.push(userTurn);

        const assistantTurn: AssistantTurn = createAssistantTurn();
        state.turns.push(assistantTurn);
        state.streamingTurnId = assistantTurn.id;
      })
      .addCase(executeStream.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to send streaming request';
        state.streamingTurnId = null;
      })
      .addCase(executeStream.fulfilled, (state) => {
        handleStreamFulfilled(state);
      })
      // Submit elicitation response
      .addCase(resumeStream.pending, (state) => {
        state.loading = true;
        state.error = null;
        const turn = getStreamingTurn(state);
        if (turn) {
          delete turn.confirmationRequests;
        }
      })
      .addCase(resumeStream.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to submit elicitation response';
        state.streamingTurnId = null;
      })
      .addCase(resumeStream.fulfilled, (state) => {
        handleStreamFulfilled(state);
      })
      // Cache fetched data sources
      .addCase(fetchDataSources.fulfilled, (state, { payload }) => {
        Object.assign(state.dataSources, payload);
      });
  },
  selectors: {
    selectSessions: (state: State) => state.sessions,
    selectTurns: (state: State) => state.turns,
    selectDataSources: (state: State) => state.dataSources,
    selectHasMessages: (state: State) => state.turns.length > 0,
    selectLoading: (state: State) => state.loading,
    selectError: (state: State) => state.error,
    selectSessionId: (state: State) => state.sessionId,
  },
});

export const {
  clearMessages,
  applyStreamEvent,
  toggleProcessStep,
  setSessionId,
} = ChatSlice.actions;

export const {
  selectSessions,
  selectTurns,
  selectDataSources,
  selectHasMessages,
  selectLoading,
  selectError,
  selectSessionId,
} = ChatSlice.selectors;

export default ChatSlice.reducer;
