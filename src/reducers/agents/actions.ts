import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { Agent } from 'models/interfaces/agent';
import { AIModel } from 'models/interfaces/aiModel';
import { AgentService } from 'services/agent';
import { DomoAIService } from 'services/ai';

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

export const fetchAIModels = createAsyncThunk<
  AIModel[],
  void,
  { state: RootState }
>('agents/fetchAIModels', async (_, { getState }) => {
  const { aiModels } = getState().agents;
  if (aiModels.length > 0) {
    return aiModels;
  }
  return DomoAIService.fetchModels();
});

export const fetchAgentById = createAsyncThunk<
  Agent,
  string,
  { state: RootState }
>('agents/fetchAgentById', async (agentId) => {
  return AgentService.getAgent(agentId);
});

export const createCustomAgent = createAsyncThunk<
  Agent,
  Agent,
  { state: RootState }
>('agents/createCustomAgent', async (agent, { getState }) => {
  return AgentService.createAgent(agent);
});

export const updateCustomAgent = createAsyncThunk<
  Agent,
  Agent,
  { state: RootState }
>('agents/updateCustomAgent', async (agent, { getState }) => {
  return AgentService.updateAgent(agent);
});
