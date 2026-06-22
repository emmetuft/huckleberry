import { apiFetch } from 'services/headers';
import { Toolkit } from 'models/interfaces/toolkit';
import { handleResponse } from 'utils/service';
import { SearchFilter } from 'models/interfaces/search';

const TOOLKITS_API_BASE = '/api/toolkits';

const getToolkits = async ({
  filters,
  limit = 50,
  offset = 0,
}: {
  filters: SearchFilter[];
  limit?: number;
  offset?: number;
}): Promise<Toolkit[]> => {
  const params = {
    filters,
    limit,
    offset,
  };
  const response = await apiFetch(TOOLKITS_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  const data = await handleResponse<{ toolkits: Toolkit[] }>(response);
  return data.toolkits;
};

export const ToolkitsService = {
  getToolkits,
};
