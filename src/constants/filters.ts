import { v4 as uuidv4 } from 'uuid';
import {
  GraphFilterCondition,
  GraphFilterDataType,
} from 'models/interfaces/graphFilter';
import { Filter, FilterOperator } from 'models/interfaces/filter';

export const DEFAULT_FILTER: Filter = {
  id: uuidv4(),
  column: '',
  operator: FilterOperator.EQUALS,
  value: '',
};

export const DEFAULT_GRAPH_FILTER: GraphFilterCondition = {
  id: uuidv4(),
  nodeLabel: '',
  property: '',
  operator: '',
  value: null,
  valueType: GraphFilterDataType.STRING,
};
