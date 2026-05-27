import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { Agent } from 'models/interfaces/agent';
import { AgentService } from 'services/agent';

export const fetchAgents = createAsyncThunk<
  Agent[],
  void,
  { state: RootState }
>('agents/fetchAgents', async (_, { getState }) => {
  const { agents } = getState().agents;
  if (agents.length > 0) {
    return agents;
  }
  return AgentService.getAgents();
});
