import { NodeFilter } from 'models/interfaces/graphFilter';
import { handleResponse } from 'utils/service';

const GRAPH_DB_URL = '/api/graph';

const fetchNodeModels = async <T = any>(): Promise<T[]> => {
  // TODO: Not implemented on server yet
  const response = await fetch(`${GRAPH_DB_URL}/nodes`, {
    method: 'GET',
  });
  return handleResponse<T[]>(response);
};

const fetchRelationshipModels = async <T = any>(): Promise<T[]> => {
  // TODO: Not implemented on server yet
  const response = await fetch(`${GRAPH_DB_URL}/nodes`, {
    method: 'GET',
  });
  return handleResponse<T[]>(response);
};

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
    body: JSON.stringify({ filter, limit }),
  });
  return handleResponse<T[]>(response);
};

const fetchNodeLabels = async <T = unknown>(): Promise<T[]> => {
  // TODO: Not implemented on server yet
  const response = await fetch(`${GRAPH_DB_URL}/nodes`, {
    method: 'GET',
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
  });
  return handleResponse<T[]>(response);
};

export const GraphService = {
  fetchNodeModels,
  fetchRelationshipModels,
  fetchNodes,
  fetchNodeLabels,
  fetchPropertyValues,
};
