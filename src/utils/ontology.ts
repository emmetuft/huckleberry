import { GraphNode } from 'models/interfaces/ontology';
import { formatDateTime, isValidDate } from './datetime';
import {
  GraphFilterCondition,
  GraphFilterDataType,
  GraphFilterOperator,
  PropertyFilter,
} from 'models/interfaces/graphFilter';
import {
  Filter,
  FilterColumn,
  FilterDataType,
  FilterOperator,
} from 'models/interfaces/filter';

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
): GraphFilterDataType => {
  const node = nodes.find((node) => node.labels.includes(label));

  if (
    node?.properties[property] !== undefined &&
    node?.properties[property] !== null
  ) {
    const value = node.properties[property];

    if (isValidDate(value)) return GraphFilterDataType.DATE;
    if (typeof value === 'number') return GraphFilterDataType.NUMBER;
    return GraphFilterDataType.STRING;
  }

  return GraphFilterDataType.STRING;
};

// Get operators based on property type
export const getOperatorsForType = (
  type: GraphFilterDataType,
): GraphFilterOperator[] => {
  switch (type) {
    case GraphFilterDataType.DATE:
      return [
        GraphFilterOperator.BETWEEN,
        GraphFilterOperator.GT,
        GraphFilterOperator.LT,
        GraphFilterOperator.EQUALS,
      ];
    case GraphFilterDataType.NUMBER:
      return [
        GraphFilterOperator.EQUALS,
        GraphFilterOperator.GT,
        GraphFilterOperator.LT,
        GraphFilterOperator.GTE,
        GraphFilterOperator.LTE,
        GraphFilterOperator.BETWEEN,
      ];
    case GraphFilterDataType.STRING:
    default:
      return [
        GraphFilterOperator.EQUALS,
        GraphFilterOperator.NOT_EQUALS,
        GraphFilterOperator.CONTAINS,
      ];
  }
};

export const parseFilterConditions = (
  conditions: GraphFilterCondition[],
): PropertyFilter[] => {
  return conditions.map((condition) => ({
    type: condition.valueType ?? GraphFilterDataType.STRING,
    field: condition.property,
    operator: condition.operator,
    value: condition.value,
  }));
};

const graphDataTypeMap: Record<GraphFilterDataType, FilterDataType> = {
  [GraphFilterDataType.STRING]: FilterDataType.STRING,
  [GraphFilterDataType.NUMBER]: FilterDataType.NUMBER,
  [GraphFilterDataType.DATE]: FilterDataType.DATE,
};

const filterToGraphOperatorMap: Partial<
  Record<FilterOperator, GraphFilterOperator>
> = {
  [FilterOperator.EQUALS]: GraphFilterOperator.EQUALS,
  [FilterOperator.NOT_EQUALS]: GraphFilterOperator.NOT_EQUALS,
  [FilterOperator.GREATER_THAN]: GraphFilterOperator.GT,
  [FilterOperator.LESS_THAN]: GraphFilterOperator.LT,
  [FilterOperator.GREATER_THAN_OR_EQUALS]: GraphFilterOperator.GTE,
  [FilterOperator.LESS_THAN_OR_EQUALS]: GraphFilterOperator.LTE,
  [FilterOperator.LIKE]: GraphFilterOperator.CONTAINS,
  [FilterOperator.BETWEEN]: GraphFilterOperator.BETWEEN,
};

const graphToFilterOperatorMap: Partial<
  Record<GraphFilterOperator, FilterOperator>
> = {
  [GraphFilterOperator.EQUALS]: FilterOperator.EQUALS,
  [GraphFilterOperator.NOT_EQUALS]: FilterOperator.NOT_EQUALS,
  [GraphFilterOperator.GT]: FilterOperator.GREATER_THAN,
  [GraphFilterOperator.LT]: FilterOperator.LESS_THAN,
  [GraphFilterOperator.GTE]: FilterOperator.GREATER_THAN_OR_EQUALS,
  [GraphFilterOperator.LTE]: FilterOperator.LESS_THAN_OR_EQUALS,
  [GraphFilterOperator.CONTAINS]: FilterOperator.LIKE,
  [GraphFilterOperator.BETWEEN]: FilterOperator.BETWEEN,
};

export const buildFilterColumns = (
  nodes: GraphNode[],
  labelFilters: string[],
): FilterColumn[] => {
  const columns: FilterColumn[] = [];

  for (const label of labelFilters) {
    const labelNodes = nodes.filter((n) => n.labels.includes(label));
    const propertyNames = new Set<string>();
    labelNodes.forEach((n) =>
      Object.keys(n.properties).forEach((p) => propertyNames.add(p)),
    );

    Array.from(propertyNames)
      .sort()
      .forEach((property) => {
        const graphType = getPropertyType(nodes, label, property);
        columns.push({
          key: `${label}:${property}`,
          label: property,
          group: label,
          type: graphDataTypeMap[graphType],
        });
      });
  }

  return columns;
};

export const filtersToGraphConditions = (
  filters: Filter[],
  nodes: GraphNode[],
): GraphFilterCondition[] => {
  return filters.flatMap((filter) => {
    const graphOperator = filterToGraphOperatorMap[filter.operator];
    if (!graphOperator) return [];

    const colonIdx = filter.column.indexOf(':');
    if (colonIdx === -1) return [];

    const nodeLabel = filter.column.substring(0, colonIdx);
    const property = filter.column.substring(colonIdx + 1);

    return [
      {
        id: filter.id,
        nodeLabel,
        property,
        operator: graphOperator,
        value: filter.value,
        valueType: getPropertyType(nodes, nodeLabel, property),
      },
    ];
  });
};

export const graphConditionsToFilters = (
  conditions: GraphFilterCondition[],
): Filter[] => {
  return conditions.flatMap((condition) => {
    const operator =
      graphToFilterOperatorMap[condition.operator as GraphFilterOperator];
    if (!operator) return [];

    return [
      {
        id: condition.id,
        column: `${condition.nodeLabel}:${condition.property}`,
        operator,
        value: condition.value,
      },
    ];
  });
};
