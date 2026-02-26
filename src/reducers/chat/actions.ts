import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { StreamStatus, StreamType } from 'models/enums/stream';
import { ProcessedFile } from 'models/interfaces/files';
import { MCPToolCall } from 'models/interfaces/mcpServer';
import { SystemResponse, UserRequest } from 'models/interfaces/userRequest';
import { AgentService } from 'services/agent';

/**
 * Send a streaming request using context builder
 * This action dispatches intermediate updates as the stream progresses
 */
export const sendStreamingRequest = createAsyncThunk<
  SystemResponse,
  {
    userInput: string;
    files?: ProcessedFile[];
    tools?: MCPToolCall[];
    dataSources?: any;
  },
  { state: RootState }
>(
  'chat/sendStreamingRequest',
  async ({ userInput, files, tools, dataSources }, { getState, dispatch }) => {
    const state = getState();
    const identity = state.app.identity;

    // Add userId, files, and tools to the query if they exist
    const queryWithUserId: UserRequest = {
      userInput,
      userId: identity?.userId,
      files,
      tools,
      dataSources,
    };

    let context: any = undefined;
    let fullText = '';

    // Stream the response
    for await (const message of AgentService.queryStream(queryWithUserId)) {
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
  },
);
