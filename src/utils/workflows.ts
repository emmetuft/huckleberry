import { WorkflowFilter } from 'models/interfaces/workflow';

export const buildFilters = (
  activeTab: string,
  ownerId: string | null,
  trigger: string,
  search: string,
): WorkflowFilter[] => {
  const filters: WorkflowFilter[] = [];

  if (activeTab === 'yours' && ownerId) {
    filters.push({
      filterType: 'term',
      field: 'owner',
      value: ownerId,
    });
  }

  if (trigger && trigger !== 'all') {
    filters.push({
      filterType: 'term',
      field: 'trigger',
      value: trigger,
    });
  }

  if (search) {
    filters.push({
      filterType: 'wildcard',
      field: 'name',
      queryString: search,
    });
  }

  return filters;
};
