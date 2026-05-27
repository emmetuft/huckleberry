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
): Promise<Agent[]> => {
  const response = await fetch(`${AGENT_API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit, offset }),
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

export const AgentService = {
  getAgents,
};
