import {
  isInt,
  isDate,
  isDateTime,
  isTime,
  isLocalDateTime,
  isLocalTime,
  isDuration,
} from 'neo4j-driver';
import {
  FilterCondition,
  FilterOperator,
} from '../../shared/models/interfaces/filters.js';

export function parseResponseData(records: any[]) {
  const nodesMap = new Map();
  const relationshipsMap = new Map();

  records.forEach((record: any) => {
    // Cypher query must return 'n', 'r', and 'm' aliases
    const { n, r, m } = record;

    if (n && !nodesMap.has(n.identity)) {
      nodesMap.set(n.identity, {
        id: n.identity,
        labels: n.labels,
        properties: n.properties,
      });
    }

    if (m && !nodesMap.has(m.identity)) {
      nodesMap.set(m.identity, {
        id: m.identity,
        labels: m.labels,
        properties: m.properties,
      });
    }

    if (r && !relationshipsMap.has(r.identity)) {
      relationshipsMap.set(r.identity, {
        id: r.identity,
        type: r.type,
        source: r.start,
        target: r.end,
        properties: r.properties,
      });
    }
  });

  const nodes = Array.from(nodesMap.values());
  const relationships = Array.from(relationshipsMap.values());
  return { nodes, relationships };
}

/**
 * Convert an individual value to its JavaScript equivalent
 *
 * @param {any} value
 * @returns {any}
 */
function valueToNativeType(value: any) {
  if (Array.isArray(value)) {
    value = value.map((innerValue) => valueToNativeType(innerValue));
  } else if (isInt(value)) {
    value = value.toString();
  } else if (
    isDate(value) ||
    isDateTime(value) ||
    isTime(value) ||
    isLocalDateTime(value) ||
    isLocalTime(value) ||
    isDuration(value)
  ) {
    value = value.toString();
  } else if (
    typeof value === 'object' &&
    value !== undefined &&
    value !== null
  ) {
    value = toNativeTypes(value);
  }

  return value;
}

/**
 * Convert Neo4j Properties back into JavaScript types
 *
 * @param {Record<string, any>} properties
 * @return {Record<string, any>}
 */
export function toNativeTypes(properties: any) {
  return Object.fromEntries(
    Object.keys(properties).map((key) => {
      let value = valueToNativeType(properties[key]);
      return [key, value];
    }),
  );
}

/**
 * Build a single property condition for Cypher
 * @param filter - Filter condition
 * @param index - Index for unique param naming
 * @param params - Object to store parameterized values (mutated)
 * @returns Cypher condition string
 */
function buildPropertyCondition(
  filter: FilterCondition,
  index: number,
  params: Record<string, any>,
): string {
  const paramKey = `filterValue${index}`;
  const property = `n.${filter.property}`;

  switch (filter.operator) {
    case FilterOperator.EQUALS:
      params[paramKey] = filter.value;
      return `${property} = $${paramKey}`;

    case FilterOperator.NOT_EQUALS:
      params[paramKey] = filter.value;
      return `${property} <> $${paramKey}`;

    case FilterOperator.CONTAINS:
      params[paramKey] = filter.value;
      return `toLower(toString(${property})) CONTAINS toLower($${paramKey})`;

    case FilterOperator.GT:
      params[paramKey] = filter.value;
      return `${property} > $${paramKey}`;

    case FilterOperator.LT:
      params[paramKey] = filter.value;
      return `${property} < $${paramKey}`;

    case FilterOperator.GTE:
      params[paramKey] = filter.value;
      return `${property} >= $${paramKey}`;

    case FilterOperator.LTE:
      params[paramKey] = filter.value;
      return `${property} <= $${paramKey}`;

    case FilterOperator.BETWEEN:
      // Convert dates to "YYYY-MM-DD HH:mm:ss" format if dealing with date type
      if (filter.valueType === 'date') {
        params[`${paramKey}Min`] = new Date(filter.value[0])
          .toISOString()
          .replace('T', ' ')
          .slice(0, 19);
        params[`${paramKey}Max`] = new Date(filter.value[1])
          .toISOString()
          .replace('T', ' ')
          .slice(0, 19);
      } else {
        params[`${paramKey}Min`] = filter.value[0];
        params[`${paramKey}Max`] = filter.value[1];
      }
      return `${property} >= $${paramKey}Min AND ${property} <= $${paramKey}Max`;

    case FilterOperator.BEFORE:
      // Convert ISO date to "YYYY-MM-DD HH:mm:ss" format
      params[paramKey] = new Date(filter.value)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19);
      return `${property} < $${paramKey}`;

    case FilterOperator.AFTER:
      // TODO: This isn't working for date values
      // Convert ISO date to "YYYY-MM-DD HH:mm:ss" format
      params[paramKey] = new Date(filter.value)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19);
      return `${property} > $${paramKey}`;

    default:
      return '';
  }
}

/**
 * Build Cypher WHERE clause that applies property filters to specific node labels
 * @param labels - Array of all requested labels
 * @param filters - Array of filter conditions
 * @param params - Object to store parameterized values (mutated)
 * @returns Cypher WHERE clause string
 */
export function buildLabelFilterConditions(
  labels: string[],
  filters: FilterCondition[],
  params: Record<string, any>,
): string {
  if (!filters || filters.length === 0) {
    // No property filters, just match by labels
    if (labels.length === 0) return '';
    return labels.map((l) => `'${l}' IN labels(n)`).join(' OR ');
  }

  // Group filters by node label
  const filtersByLabel = new Map<string, FilterCondition[]>();
  filters.forEach((filter) => {
    if (!filtersByLabel.has(filter.nodeLabel)) {
      filtersByLabel.set(filter.nodeLabel, []);
    }
    filtersByLabel.get(filter.nodeLabel)!.push(filter);
  });

  // Build conditions for each label
  const labelConditions: string[] = [];
  let filterIndex = 0;

  labels.forEach((label) => {
    const filtersForLabel = filtersByLabel.get(label);

    if (filtersForLabel && filtersForLabel.length > 0) {
      // This label has property filters
      const propertyConditions = filtersForLabel
        .map((filter) => buildPropertyCondition(filter, filterIndex++, params))
        .filter((c) => c);

      if (propertyConditions.length > 0) {
        labelConditions.push(
          `('${label}' IN labels(n) AND ${propertyConditions.join(' AND ')})`,
        );
      }
    } else {
      // This label has no property filters, include all nodes of this label
      labelConditions.push(`'${label}' IN labels(n)`);
    }
  });

  return labelConditions.join(' OR ');
}
