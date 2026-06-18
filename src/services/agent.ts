import { apiFetch } from 'services/headers';
import { Agent } from 'models/interfaces/agent';
import { handleResponse } from 'utils/service';
import { PeopleService } from 'services/people';

const AGENT_API_BASE = '/api/agents';

/**
 * Retrieve agents with pagination
 */
const getAgents = async (
  limit: number = 48,
  offset: number = 0,
  filters?: { type: string; values: any[] }[],
): Promise<Agent[]> => {
  const response = await apiFetch(`${AGENT_API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit, offset, filters }),
  });

  const data = await handleResponse<{
    pageContext: any;
    customAgents: Agent[];
  }>(response);
  const agents = data.customAgents;
  // return agents;

  const ownerIds = Array.from(
    new Set(agents.map((agent) => agent.owner.toString())),
  );
  const owners = await PeopleService.getUsers(ownerIds);
  const ownerDisplayNameById = new Map(
    owners.map((user) => [user.id, user.displayName]),
  );

  return agents.map((agent) => ({
    ...agent,
    ownerDisplayName: ownerDisplayNameById.get(Number(agent.owner)),
  }));
};

/**
 * Retrieve an agent by ID
 */
const getAgent = async (agentId: string): Promise<Agent> => {
  const response = await apiFetch(`${AGENT_API_BASE}/${agentId}`);
  return handleResponse<Agent>(response);
};
interface AgentPayload {
  name: string;
  description: string;
  prompt: string;
  systemMessage: string;
  model?: string;
  settings?: {
    id?: string | null;
    properties: Record<string, any>;
  };
  uiSettings?: Record<string, any>;
  theme?: Record<string, any>;
  context?: {
    dataSourceIds?: string[];
    cardIds?: string[];
    pageIds?: string[];
    ignorableDataSourceIds?: string[];
    filters?: any[];
    fileSets?: any[];
    dataApps?: any[];
    descriptions?: Record<string, string>;
  };
  toolkitIds?: string[];
}

/**
 * Create a new agent
 */
const createAgent = async (agent: Agent): Promise<Agent> => {
  const payload: AgentPayload = {
    name: agent.name,
    description: agent.description,
    prompt: agent.prompt,
    systemMessage: agent.systemMessage,
    model: agent.model,
    settings: agent.settings ?? {
      properties: {
        reasoningEffort: 'MEDIUM',
        allowSkipPlanning: false,
      },
    },
    context: agent.context ?? { dataSourceIds: [], fileSets: [] },
    toolkitIds: agent.toolkitIds,
  };

  const response = await apiFetch(AGENT_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<Agent>(response);
};

/**
 * Update an existing agent
 */
const updateAgent = async (agent: Agent): Promise<Agent> => {
  const payload = {
    name: agent.name,
    description: agent.description,
    prompt: agent.prompt,
    systemMessage: agent.systemMessage,
    context: agent.context,
    toolkitIds: agent.toolkitIds,
  };

  const response = await apiFetch(`${AGENT_API_BASE}/${agent.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<Agent>(response);
};

/**
 * Delete an agent by ID
 */
const deleteAgent = async (agentId: string): Promise<void> => {
  await apiFetch(`${AGENT_API_BASE}/${agentId}`, {
    method: 'DELETE',
  });
};

export const AgentService = {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
};
