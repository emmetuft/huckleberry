import { v4 as uuidv4 } from 'uuid';
import { FilterCondition, FilterDataType } from 'models/interfaces/graphFilter';

export const DEFAULT_FILTER: FilterCondition = {
  id: uuidv4(),
  nodeLabel: '',
  property: '',
  operator: '',
  value: null,
  valueType: FilterDataType.STRING,
};
