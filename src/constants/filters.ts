import { FilterCondition, FilterDataType } from 'models/interfaces/graphFilter';

export const DEFAULT_FILTER: FilterCondition = {
  id: Date.now().toString(),
  nodeLabel: '',
  property: '',
  operator: '',
  value: null,
  valueType: FilterDataType.STRING,
};
