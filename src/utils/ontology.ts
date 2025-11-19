import { Neo4jNode } from 'models/interfaces/ontology';
import { formatDateTime, isValidDate } from './datetime';
import { FilterDataType, FilterOperator } from 'models/enums/filters';

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
  nodes: Neo4jNode[],
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
export const getOperatorsForType = (
  type: FilterDataType,
): Array<{ label: string; value: string }> => {
  switch (type) {
    case FilterDataType.DATE:
      return [
        { label: 'Between', value: FilterOperator.BETWEEN },
        { label: 'Before', value: FilterOperator.BEFORE },
        { label: 'After', value: FilterOperator.AFTER },
        { label: 'Equals', value: FilterOperator.EQUALS },
      ];
    case FilterDataType.NUMBER:
      return [
        { label: 'Equals', value: FilterOperator.EQUALS },
        { label: 'Greater than', value: FilterOperator.GT },
        { label: 'Less than', value: FilterOperator.LT },
        { label: 'Greater or equal', value: FilterOperator.GTE },
        { label: 'Less or equal', value: FilterOperator.LTE },
        { label: 'Between', value: FilterOperator.BETWEEN },
      ];
    case FilterDataType.STRING:
    default:
      return [
        { label: 'Equals', value: FilterOperator.EQUALS },
        { label: 'Not equals', value: FilterOperator.NOT_EQUALS },
        { label: 'Contains', value: FilterOperator.CONTAINS },
        { label: 'Starts with', value: FilterOperator.STARTS_WITH },
        { label: 'Ends with', value: FilterOperator.ENDS_WITH },
      ];
  }
};
