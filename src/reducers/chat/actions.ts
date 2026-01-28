import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContextService } from 'services/context';
import {
  SystemResponse,
  UserRequest,
} from '../../../shared/models/interfaces/userRequest';
import { RootState } from '../index';

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
      userId: 810086698,
    };

    return await ContextService.query(queryWithUserId);
  },
);
