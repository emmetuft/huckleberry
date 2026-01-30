import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { StreamStatus, StreamType } from '../../../shared/models/enums/stream';
import {
  SystemResponse,
  UserRequest,
} from '../../../shared/models/interfaces/userRequest';
import { ContextService } from 'services/context';

/**
 * Send a request using context builder to get a complete response
 */
export const sendRequest = createAsyncThunk<SystemResponse, string>(
  'chat/sendRequest',
  async (userInput, { getState }) => {
    const state = getState() as RootState;
    const identity = state.app.identity;

    // Add userId to the query if identity exists
    const queryWithUserId: UserRequest = {
      userInput: userInput,
      userId: identity?.userId,
    };

    return await ContextService.query(queryWithUserId);
  },
);

/**
 * Send a streaming request using context builder
 * This action dispatches intermediate updates as the stream progresses
 */
export const sendStreamingRequest = createAsyncThunk<
  SystemResponse,
  string,
  { state: RootState }
>('chat/sendStreamingRequest', async (userInput, { getState, dispatch }) => {
  const state = getState();
  const identity = state.app.identity;

  // Add userId to the query if identity exists
  const queryWithUserId: UserRequest = {
    userInput: userInput,
    userId: identity?.userId,
  };

  let context: any = undefined;
  let fullText = '';

  // Stream the response
  for await (const message of ContextService.queryStream(queryWithUserId)) {
    if (message.type === StreamType.STATUS) {
      dispatch({
        type: 'chat/updateStreamStatus',
        payload: message.message,
      });
    } else if (message.type === StreamType.STEP_START && message.step) {
      dispatch({
        type: 'chat/addProcessStep',
        payload: message.step,
      });
    } else if (message.type === StreamType.STEP_COMPLETE && message.step) {
      dispatch({
        type: 'chat/updateProcessStep',
        payload: message.step,
      });
    } else if (message.type === StreamType.METADATA && message.context) {
      context = message.context;
    } else if (message.type === StreamType.TEXT && message.content) {
      fullText += message.content;
      dispatch({
        type: 'chat/appendStreamText',
        payload: message.content,
      });
    } else if (message.type === StreamType.DONE) {
      dispatch({
        type: 'chat/updateProcessStep',
        payload: {
          id: 'generate-response',
          title: 'Generating response',
          status: StreamStatus.COMPLETE,
        },
      });
    }
  }

  return {
    output: fullText,
    context,
  };
});
