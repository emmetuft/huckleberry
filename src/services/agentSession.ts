import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { handleResponse } from 'utils/service';

const SESSION_API_BASE = '/api/sessions';

/**
 * Retrieve all agent sessions
 */
const getSessions = async (): Promise<AgentSession[]> => {
  const response = await fetch(`${SESSION_API_BASE}`, {
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

/**
 * Retrieve an agent session by session ID
 */
const getSession = async (sessionId: string): Promise<AgentSession> => {
  const response = await fetch(`${SESSION_API_BASE}/${sessionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return await handleResponse<AgentSession>(response);
};

/**
 * Retrieve all events for a given session ID
 */
const getSessionEvents = async (
  sessionId: string,
): Promise<AISessionEvent[]> => {
  const response = await fetch(`${SESSION_API_BASE}/${sessionId}/events`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await handleResponse<{
    events: AISessionEvent[];
    pageContext: { next: string };
    requestId: string | null;
    sessionId: string;
  }>(response);
  return data.events;
};

/**
 * Delete an agent session by session ID
 */
const deleteSession = async (sessionId: string): Promise<any> => {
  const response = await fetch(`${SESSION_API_BASE}/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  return await handleResponse<any>(response); // Returns empty string for data
};

export const AgentSessionService = {
  getSessions,
  getSession,
  getSessionEvents,
  deleteSession,
};
