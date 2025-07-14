export interface AutomationRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  active: boolean;
  aiGenerated?: boolean;
  sourceId?: string;
}

export interface RuleCondition {
  id: string;
  column: string;
  operator: RuleOperator;
  value: any; // The type of value can vary based on the operator
}

export interface RuleAction {
  id: string;
  type: string;
  value: any;
}

export enum RuleOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_OR_EQUALS = '>=',
  LESS_THAN_OR_EQUALS = '<=',
  // IN = 'IN',
  // NOT_IN = 'NOT IN',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
  // BETWEEN = 'BETWEEN',
}
