import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { ProcessedFile } from 'models/interfaces/files';
import { Tool } from 'models/interfaces/toolkit';
import {
  ElicitationResponse,
  ResumeRequest,
} from 'models/interfaces/userRequest';
import { AgentService } from 'services/agent';
import { applyStreamEvent, setSessionId } from './slice';

export const fetchSessions = createAsyncThunk(
  'chat/fetchSessions',
  AgentService.getSessions,
);

export const fetchSession = createAsyncThunk(
  'chat/fetchSession',
  async (sessionId: string) => {
    const session = await AgentService.getSession(sessionId);
    const events = await AgentService.getSessionEvents(sessionId);
    return { ...session, events };
  },
);

export const deleteSession = createAsyncThunk(
  'chat/deleteSession',
  AgentService.deleteSession,
);

const handleStreamEvent = (
  event: AISessionEvent,
  dispatch: any,
  sessionId: string | undefined,
): void => {
  // Capture sessionId from the first event
  if (!sessionId && event.sessionId) {
    dispatch(setSessionId(event.sessionId));
  }

  dispatch(applyStreamEvent(event));
};

/**
 * Send a streaming request to the huckleberry agent
 */
export const executeStream = createAsyncThunk<
  void,
  {
    userInput: string;
    files?: ProcessedFile[];
    tools?: Tool[];
    dataSources?: any;
  },
  { state: RootState }
>('chat/executeStream', async (params, { getState, dispatch }) => {
  const { sessionId } = getState().chat;

  for await (const event of AgentService.executeStream(params, sessionId)) {
    handleStreamEvent(event, dispatch, sessionId);
  }
});

/**
 * Submit an elicitation response
 */
export const resumeStream = createAsyncThunk<
  void,
  {
    batchId?: string;
    requestId: string;
    responses: Array<ElicitationResponse>;
  },
  { state: RootState }
>(
  'chat/resumeStream',
  async ({ batchId, requestId, responses }, { getState, dispatch }) => {
    const { sessionId } = getState().chat;

    if (!sessionId || !batchId) {
      throw new Error('Session ID or batch ID missing');
    }

    const params: ResumeRequest = {
      batchId,
      sourceRequestId: requestId,
      aiAssistantContext: {},
      responseItems: responses,
    };

    for await (const event of AgentService.resumeStream(params, sessionId)) {
      handleStreamEvent(event, dispatch, sessionId);
    }
  },
);
