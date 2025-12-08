import {
  FilterCondition,
  FilterDataType,
} from '../../shared/models/interfaces/filters';

export const DEFAULT_FILTER: FilterCondition = {
  id: Date.now().toString(),
  nodeLabel: '',
  property: '',
  operator: '',
  value: null,
  valueType: FilterDataType.STRING,
};
