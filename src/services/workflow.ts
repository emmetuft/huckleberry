import { apiFetch } from 'services/headers';
import { Workflow, WorkflowFilter } from 'models/interfaces/workflow';
import { handleResponse } from 'utils/service';

const WORKFLOWS_API_BASE = '/api/workflows';

const getWorkflows = async (
  filters: WorkflowFilter[],
  count: number = 51,
  offset: number = 0,
): Promise<Workflow[]> => {
  const params = {
    filters,
    count,
    offset,
  };
  const response = await apiFetch(WORKFLOWS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<Workflow[]>(response);
};

export const WorkflowsService = {
  getWorkflows,
};
