import { createAsyncThunk } from '@reduxjs/toolkit';
import { GraphRagService } from 'services/graphRag';
import {
  SystemResponse,
  UserRequest,
} from '../../../shared/models/interfaces/userRequest';
import { RootState } from '../index';

/**
 * Query the graph using RAG and get a complete response
 */
export const queryGraphRag = createAsyncThunk<SystemResponse, UserRequest>(
  'graphRag/query',
  async (query, { getState }) => {
    const state = getState() as RootState;
    const identity = state.app.identity;

    // Add userId to the query if identity exists
    const queryWithUserId: UserRequest = {
      ...query,
      userId: 810086698,
    };

    return await GraphRagService.query(queryWithUserId);
  },
);
