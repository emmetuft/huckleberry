import { apiFetch } from 'services/headers';
import {
  Toolkit,
  ToolkitSearchPage,
  SearchToolkitsRequest,
} from 'models/interfaces/toolkit';
import { handleResponse } from 'utils/service';

const TOOLKITS_API_BASE = '/api/toolkits';

const getToolkits = async (): Promise<Toolkit[]> => {
  const response = await apiFetch(TOOLKITS_API_BASE);
  const data = await handleResponse<{ pageContext: any; toolkits: Toolkit[] }>(
    response,
  );
  return data.toolkits;
};

const searchToolkits = async (
  request: SearchToolkitsRequest,
): Promise<ToolkitSearchPage> => {
  const response = await apiFetch(`${TOOLKITS_API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<ToolkitSearchPage>(response);
};

export const ToolkitsService = {
  getToolkits,
  searchToolkits,
};
