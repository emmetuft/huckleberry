import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { Agent } from 'models/interfaces/agent';
import { AIModel } from 'models/interfaces/aiModel';
import { SearchQuery } from 'models/interfaces/search';
import { AgentService } from 'services/agent';
import { AgentSessionService } from 'services/agentSession';
import { DomoAIService } from 'services/ai';
import { fetchSessionGraph } from 'utils/graph';

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
  return DomoAIService.getModels();
});

export const fetchAgentById = createAsyncThunk<
  Agent,
  string,
  { state: RootState }
>('agents/fetchAgentById', async (agentId, { getState }) => {
  const existing = getState().agents.agents.find((a) => a.id === agentId);
  if (existing) return existing;
  return AgentService.getAgent(agentId);
});

export const upsertCustomAgent = createAsyncThunk<Agent, Agent>(
  'agents/upsertCustomAgent',
  async (agent) => {
    if (agent.id === 'new') {
      return AgentService.createAgent(agent);
    }
    return AgentService.updateAgent(agent);
  },
);

export const deleteCustomAgent = createAsyncThunk<string, string>(
  'agents/deleteCustomAgent',
  async (agentId) => {
    await AgentService.deleteAgent(agentId);
    return agentId;
  },
);

export const fetchSessions = createAsyncThunk(
  'agents/fetchSessions',
  async ({
    agentId,
    query,
  }: { agentId?: string; query?: SearchQuery } = {}) => {
    return AgentSessionService.getSessions(query, agentId);
  },
);

export const fetchAllSessions = createAsyncThunk(
  'agents/fetchAllSessions',
  async (query?: SearchQuery) => {
    return AgentSessionService.getAllSessions(query);
  },
);

export const fetchSessionGraphThunk = createAsyncThunk(
  'agents/fetchSessionGraph',
  async (sessionId: string) => {
    const graph = await fetchSessionGraph(sessionId);
    return { sessionId, graph };
  },
);
