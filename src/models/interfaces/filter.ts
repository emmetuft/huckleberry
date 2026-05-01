export interface Filter {
  id: string;
  column: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_OR_EQUALS = '>=',
  LESS_THAN_OR_EQUALS = '<=',
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT LIKE',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
  BETWEEN = 'BETWEEN',
}

export const operatorLabelMap: Record<FilterOperator, string> = {
  [FilterOperator.EQUALS]: 'equals',
  [FilterOperator.NOT_EQUALS]: 'not equals',
  [FilterOperator.GREATER_THAN]: 'greater than',
  [FilterOperator.LESS_THAN]: 'less than',
  [FilterOperator.GREATER_THAN_OR_EQUALS]: 'greater than or equals',
  [FilterOperator.LESS_THAN_OR_EQUALS]: 'less than or equals',
  [FilterOperator.LIKE]: 'like',
  [FilterOperator.NOT_LIKE]: 'not like',
  [FilterOperator.IN]: 'in',
  [FilterOperator.NOT_IN]: 'not in',
  [FilterOperator.IS_NULL]: 'is null',
  [FilterOperator.IS_NOT_NULL]: 'is not null',
  [FilterOperator.BETWEEN]: 'between',
};
