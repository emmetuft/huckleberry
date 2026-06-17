import { AgentSession } from 'models/interfaces/session';
import { handleResponse } from 'utils/service';

const HUCKLEBERRY_API_BASE = '/api/huckleberry';

const getSessions = async (): Promise<AgentSession[]> => {
  const response = await fetch(`${HUCKLEBERRY_API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await handleResponse<{
    pageContext: any;
    sessions: AgentSession[];
  }>(response);
  return data.sessions.sort(
    (a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );
};

export const HuckleberryService = {
  getSessions,
};
