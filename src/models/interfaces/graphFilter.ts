export interface GraphFilterCondition {
  id: string;
  nodeLabel: string;
  property: string;
  operator: GraphFilterOperator | '';
  value: any;
  valueType?: GraphFilterDataType;
}

export enum GraphFilterDataType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
}

export enum GraphFilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  BETWEEN = 'between',
}

export const OperatorOptionMap: Record<GraphFilterOperator, string> = {
  [GraphFilterOperator.EQUALS]: 'Equals',
  [GraphFilterOperator.NOT_EQUALS]: 'Not equals',
  [GraphFilterOperator.CONTAINS]: 'Contains',
  [GraphFilterOperator.GT]: 'Greater than',
  [GraphFilterOperator.LT]: 'Less than',
  [GraphFilterOperator.GTE]: 'Greater than or equal to',
  [GraphFilterOperator.LTE]: 'Less than or equal to',
  [GraphFilterOperator.BETWEEN]: 'Between',
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
