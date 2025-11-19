export interface FilterCondition {
  id: string;
  nodeLabel: string;
  property: string;
  operator: FilterOperator | '';
  value: any;
  valueType?: FilterDataType;
}

export enum FilterDataType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  BETWEEN = 'between',
  BEFORE = 'before',
  AFTER = 'after',
}
