import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { StreamType } from 'models/enums/stream';
import { ProcessedFile } from 'models/interfaces/files';
import { MCPToolCall } from 'models/interfaces/mcpServer';
import { SystemResponse, UserRequest } from 'models/interfaces/userRequest';
import { ContextService } from 'services/context';

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

    let fullText = '';
    let messageCount = 0;

    console.log('[sendStreamingRequest] starting stream');

    // Stream the response
    for await (const message of ContextService.queryStream(queryWithUserId)) {
      messageCount++;
      console.log(`[sendStreamingRequest] message #${messageCount}:`, {
        type: message.type,
        contentLen: message.content?.length,
        hasStep: !!message.step,
      });

      if (message.type === StreamType.ANSWER && message.content) {
        fullText += message.content;
        dispatch({
          type: 'chat/appendStreamText',
          payload: message.content,
        });
      } else if (message.type === StreamType.THINKING && message.content) {
        dispatch({
          type: 'chat/updateStreamStatus',
          payload: message.content,
        });
      } else if (message.type === StreamType.TOOL_STARTED && message.step) {
        dispatch({
          type: 'chat/addProcessStep',
          payload: message.step,
        });
      } else if (message.type === StreamType.TOOL_COMPLETED && message.step) {
        dispatch({
          type: 'chat/updateProcessStep',
          payload: message.step,
        });
      } else if (message.type === StreamType.ERROR && message.message) {
        dispatch({
          type: 'chat/updateStreamStatus',
          payload: message.message,
        });
      }
    }

    console.log(
      `[sendStreamingRequest] stream complete — ${messageCount} messages, fullText length: ${fullText.length}`,
    );

    return {
      output: fullText,
    };
  },
);
