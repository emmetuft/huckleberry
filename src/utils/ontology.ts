import { GraphNode } from 'models/interfaces/ontology';
import { formatDateTime, isValidDate } from './datetime';
import {
  FilterCondition,
  FilterDataType,
  FilterOperator,
  PropertyFilter,
} from 'models/interfaces/graphFilter';

export const renderValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => renderValue(v)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${k}: ${renderValue(v)}`)
      .join(', ')} }`;
  }
  // Check if value is a valid date using date-fns
  if (isValidDate(value)) {
    const date = new Date(value);
    return formatDateTime(date);
  }

  return value.toString();
};

// SECTION: Graph filtering

// Get the type of a property value
export const getPropertyType = (
  nodes: GraphNode[],
  label: string,
  property: string,
): FilterDataType => {
  const node = nodes.find((node) => node.labels.includes(label));

  if (
    node?.properties[property] !== undefined &&
    node?.properties[property] !== null
  ) {
    const value = node.properties[property];

    if (isValidDate(value)) return FilterDataType.DATE;
    if (typeof value === 'number') return FilterDataType.NUMBER;
    return FilterDataType.STRING;
  }

  return FilterDataType.STRING;
};

// Get operators based on property type
export const getOperatorsForType = (type: FilterDataType): FilterOperator[] => {
  switch (type) {
    case FilterDataType.DATE:
      return [
        FilterOperator.BETWEEN,
        FilterOperator.GT,
        FilterOperator.LT,
        FilterOperator.EQUALS,
      ];
    case FilterDataType.NUMBER:
      return [
        FilterOperator.EQUALS,
        FilterOperator.GT,
        FilterOperator.LT,
        FilterOperator.GTE,
        FilterOperator.LTE,
        FilterOperator.BETWEEN,
      ];
    case FilterDataType.STRING:
    default:
      return [
        FilterOperator.EQUALS,
        FilterOperator.NOT_EQUALS,
        FilterOperator.CONTAINS,
      ];
  }
};

export const parseFilterConditions = (
  conditions: FilterCondition[],
): PropertyFilter[] => {
  return conditions.map((condition) => ({
    type: condition.valueType ?? FilterDataType.STRING,
    field: condition.property,
    operator: condition.operator,
    value: condition.value,
  }));
};
