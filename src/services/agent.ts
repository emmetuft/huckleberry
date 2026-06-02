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
  const response = await fetch(`${AGENT_API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit, offset, filters }),
  });

  const data = await handleResponse<{
    pageContext: any;
    customAgents: Agent[];
  }>(response);
  const agents = data.customAgents;
  return agents;

  // const ownerIds = Array.from(
  //   new Set(agents.map((agent) => agent.owner.toString())),
  // );
  // const owners = await PeopleService.getUsers(ownerIds);
  // const ownerDisplayNameById = new Map(
  //   owners.map((user) => [user.id, user.displayName]),
  // );

  // return agents.map((agent) => ({
  //   ...agent,
  //   ownerDisplayName: ownerDisplayNameById.get(agent.owner.toString()),
  // }));
};

/**
 * Create a new agent
 */
interface CreateAgentPayload {
  name: string;
  description: string;
  prompt: string;
  systemMessage: string;
  model?: string;
  settings?: Record<string, any>;
  context?: Record<string, any>;
  toolkitIds?: string[];
}

const createAgent = async (agent: Agent): Promise<Agent> => {
  const payload: CreateAgentPayload = {
    name: agent.name,
    description: agent.description,
    prompt: agent.prompt,
    systemMessage: agent.systemMessage,
    model: agent.model,
    context: agent.context,
    toolkitIds: agent.toolkitIds,
  };

  const response = await fetch(AGENT_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<Agent>(response);
};

export const AgentService = {
  getAgents,
  createAgent,
};
