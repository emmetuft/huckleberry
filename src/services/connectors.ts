import { apiFetch } from 'services/headers';
import { Connector, ConnectorFilter } from 'models/interfaces/connector';
import { handleResponse } from 'utils/service';

const CONNECTORS_API_BASE = '/api/connectors';

const getConnectors = async (
  filters: ConnectorFilter[],
  count: number = 51,
  offset: number = 0,
): Promise<Connector[]> => {
  const params = {
    filters,
    count,
    offset,
  };
  const response = await apiFetch(CONNECTORS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<Connector[]>(response);
};

export const ConnectorsService = {
  getConnectors,
};
