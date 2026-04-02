import { NodeFilter } from 'models/interfaces/graphFilter';
import { commonHeaders, handleResponse } from 'utils/service';

const GRAPH_DB_URL = '/api/graph';

interface FetchNodesInput {
  filter: NodeFilter;
  limit?: number;
}

const fetchNodes = async <T = any>({
  filter,
  limit,
}: FetchNodesInput): Promise<T[]> => {
  const response = await fetch(`${GRAPH_DB_URL}/nodes`, {
    method: 'POST',
    headers: commonHeaders(),
    body: JSON.stringify({ filter, limit }),
  });
  return handleResponse<T[]>(response);
};

const fetchNodeLabels = async <T = unknown>(): Promise<T[]> => {
  // TODO: Not implemented on server yet
  const response = await fetch(`${GRAPH_DB_URL}/nodes`, {
    method: 'GET',
    headers: commonHeaders(),
  });
  return handleResponse<T[]>(response);
};

const fetchPropertyValues = async <T = unknown>(
  label: string,
  property: string,
  limit: number,
): Promise<T[]> => {
  // TODO: Not implemented on server yet
  const response = await fetch(`${GRAPH_DB_URL}/nodes`, {
    method: 'GET',
    headers: commonHeaders(),
  });
  return handleResponse<T[]>(response);
};

export const GraphService = {
  fetchNodes,
  fetchNodeLabels,
  fetchPropertyValues,
};
