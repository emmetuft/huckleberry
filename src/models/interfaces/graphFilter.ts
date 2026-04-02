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
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  BETWEEN = 'between',
}

export const OperatorOptionMap: Record<FilterOperator, string> = {
  [FilterOperator.EQUALS]: 'Equals',
  [FilterOperator.NOT_EQUALS]: 'Not equals',
  [FilterOperator.CONTAINS]: 'Contains',
  [FilterOperator.GT]: 'Greater than',
  [FilterOperator.LT]: 'Less than',
  [FilterOperator.GTE]: 'Greater than or equal to',
  [FilterOperator.LTE]: 'Less than or equal to',
  [FilterOperator.BETWEEN]: 'Between',
};

export interface PropertyFilter {
  type: string;
  field: string;
  operator: string;
  value?: unknown;
}

export interface NodeFilter {
  nodeLabels?: string[];
  nodeIds?: string[];
  labelMode?: string;
  idProperty?: string;
  propertyFilters?: PropertyFilter[];
}
