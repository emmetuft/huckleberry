import { createAsyncThunk } from '@reduxjs/toolkit';
import { GraphRagService } from 'services/graphRag';
import {
  SystemResponse,
  UserRequest,
} from '../../../shared/models/interfaces/userRequest';

/**
 * Query the graph using RAG and get a complete response
 */
export const queryGraphRag = createAsyncThunk<SystemResponse, UserRequest>(
  'graphRag/query',
  async (query) => {
    return await GraphRagService.query(query);
  },
);
