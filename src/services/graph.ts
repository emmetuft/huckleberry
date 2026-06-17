import { NodeFilter } from 'models/interfaces/graphFilter';
import type {
  CypherSearchRequest,
  CypherSearchResult,
  GraphSchema,
  NodeResult,
  PathResult,
  ShortestPathRequest,
} from 'models/interfaces/graph';
import { handleResponse } from 'utils/service';

const GRAPH_API_BASE = '/api/graph';

const getNodes = async <T = NodeResult>({
  filter,
  limit,
}: {
  filter: NodeFilter;
  limit?: number;
}): Promise<T[]> => {
  const response = await fetch(`${GRAPH_API_BASE}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filter, limit }),
  });
  return handleResponse<T[]>(response);
};

const cypherSearch = async (
  request: CypherSearchRequest,
): Promise<CypherSearchResult> => {
  const response = await fetch(`${GRAPH_API_BASE}/cypher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<CypherSearchResult>(response);
};

const getSchema = async (opts?: {
  sampleSize?: number;
  includeProperties?: boolean;
}): Promise<GraphSchema> => {
  const params = new URLSearchParams();
  if (opts?.sampleSize != null)
    params.set('sampleSize', String(opts.sampleSize));
  if (opts?.includeProperties) params.set('includeProperties', 'true');
  const qs = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${GRAPH_API_BASE}/schema${qs}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<GraphSchema>(response);
};

const shortestPath = async (
  request: ShortestPathRequest,
): Promise<PathResult | null> => {
  const response = await fetch(`${GRAPH_API_BASE}/path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<PathResult | null>(response);
};

export const GraphService = {
  getNodes,
  cypherSearch,
  getSchema,
  shortestPath,
};
