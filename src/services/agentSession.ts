import { SearchQuery } from 'models/interfaces/search';
import { AgentSession } from 'models/interfaces/session';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { handleResponse } from 'utils/service';

const SESSION_API_BASE = '/api/sessions';

/**
 * Search sessions across all users (admin/cross-user endpoint).
 */
const getAllSessions = async (
  query: SearchQuery = {},
): Promise<AgentSession[]> => {
  const defaultQuery: SearchQuery = {
    sortFieldMap: { LAST_ACTIVITY: 'DESC' },
    limit: 50,
    offset: 0,
    ...query,
  };

  const response = await fetch(`${SESSION_API_BASE}/search/all-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultQuery),
  });

  const data = await handleResponse<{
    pageContext: any;
    sessions: AgentSession[];
  }>(response);
  return data.sessions;
};

/**
 * Retrieve agent sessions with optional filters, sorting, and pagination.
 */
const getSessions = async (
  query: SearchQuery = {},
  agentId?: string,
): Promise<AgentSession[]> => {
  const defaultQuery: SearchQuery = {
    sortFieldMap: { LAST_ACTIVITY: 'DESC' },
    limit: 50,
    offset: 0,
    ...query,
  };

  const response = await fetch(
    `${SESSION_API_BASE}${agentId ? `?agentId=${agentId}` : ''}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultQuery),
    },
  );

  const data = await handleResponse<{
    pageContext: any;
    sessions: AgentSession[];
  }>(response);
  return data.sessions;
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
  getAllSessions,
  getSessions,
  getSession,
  getSessionEvents,
  deleteSession,
};
