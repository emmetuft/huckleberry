import {
  FilterOperator,
  TimeFilter,
} from '../../shared/models/interfaces/filters.ts';

/**
 * Build WHERE clause from time filter object
 */
export function buildWhereClause(
  timeFilter: TimeFilter,
  timeColumn: string,
): string {
  if (!timeFilter) {
    return '';
  }

  const { start, end, operator } = timeFilter;

  switch (operator) {
    case FilterOperator.BETWEEN:
      if (start && end) {
        return `WHERE ${timeColumn} BETWEEN '${start}' AND '${end}'`;
      }
      break;
    case FilterOperator.GT:
      if (start) {
        return `WHERE ${timeColumn} > '${start}'`;
      }
      break;
    case FilterOperator.GTE:
      if (start) {
        return `WHERE ${timeColumn} >= '${start}'`;
      }
      break;
    case FilterOperator.LT:
      if (end) {
        return `WHERE ${timeColumn} < '${end}'`;
      }
      break;
    case FilterOperator.LTE:
      if (end) {
        return `WHERE ${timeColumn} <= '${end}'`;
      }
      break;
    case FilterOperator.EQUALS:
      if (start) {
        return `WHERE ${timeColumn} = '${start}'`;
      }
      break;
  }

  return '';
}

/**
 * Add time column to SELECT clause if not already present
 */
export function addTimeColumnToSelect(
  query: string,
  timeColumn: string,
): string {
  // Extract the SELECT clause (everything between SELECT and FROM)
  const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/is);
  if (!selectMatch) {
    return query;
  }

  const selectClause = selectMatch[1];

  // Check if the time column is already in the SELECT clause
  // Handle both direct column names and aliases (e.g., "date_col AS date")
  const timeColumnRegex = new RegExp(
    `(^|[,\\s])${timeColumn}($|[,\\s]|\\s+AS\\s+)`,
    'i',
  );

  if (timeColumnRegex.test(selectClause)) {
    // Time column already in SELECT clause
    return query;
  }

  // Add time column to SELECT clause
  const newSelectClause = `${selectClause}, ${timeColumn}`;
  return query.replace(
    /SELECT\s+(.*?)\s+FROM/is,
    `SELECT ${newSelectClause} FROM`,
  );
}

/**
 * Add WHERE clause to SQL query
 */
export function addWhereClauseToQuery(
  query: string,
  whereClause: string,
): string {
  if (!whereClause) {
    return query;
  }

  // Check if query already has a WHERE clause
  const hasWhere = /WHERE/i.test(query);
  if (hasWhere) {
    // Replace WHERE with WHERE ... AND
    return query.replace(/WHERE/i, `${whereClause} AND`);
  }

  // Append WHERE clause before ORDER BY, LIMIT, or at the end
  const orderByMatch = query.match(/ORDER BY/i);
  const limitMatch = query.match(/LIMIT/i);

  if (orderByMatch) {
    const index = query.indexOf(orderByMatch[0]);
    return `${query.slice(0, index)} ${whereClause} ${query.slice(index)}`;
  } else if (limitMatch) {
    const index = query.indexOf(limitMatch[0]);
    return `${query.slice(0, index)} ${whereClause} ${query.slice(index)}`;
  }

  return `${query} ${whereClause}`;
}
