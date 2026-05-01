import { DataType } from 'models/enums/dataType';
import { Filter, FilterOperator } from 'models/interfaces/filter';

export const mapDataTypeToSQL = (type: DataType): string => {
  switch (type) {
    case DataType.DATE:
      return 'DATE';
    case DataType.DATETIME:
      return 'TIMESTAMP'; // DuckDB uses TIMESTAMP for DATETIME values
    case DataType.DECIMAL:
      return 'DECIMAL(18,6)'; // Adjust precision/scale as needed
    case DataType.DOUBLE:
      return 'DOUBLE PRECISION'; // DuckDB supports DOUBLE PRECISION
    case DataType.LONG:
      return 'INTEGER'; // LONG typically maps to BIGINT in SQL
    case DataType.STRING:
      return 'TEXT'; // DuckDB uses TEXT for variable-length strings
    default:
      throw new Error(`Unsupported data type: ${type}`);
  }
};

const escapeSingleQuotes = (value: string): string => value.replace(/'/g, "''");

export const getWhereClause = (filters: Filter[]) =>
  filters
    .map((filter) => {
      const formatValue = (v: any) =>
        typeof v === 'string' ? `'${escapeSingleQuotes(v)}'` : v;

      if (
        [FilterOperator.IN, FilterOperator.NOT_IN].includes(filter.operator)
      ) {
        const values = filter.value.map(formatValue).join(', ');
        return `"${filter.column}" ${filter.operator} (${values})`;
      }

      if (
        filter.operator === FilterOperator.BETWEEN &&
        filter.value.length === 2
      ) {
        const [start, end] = filter.value;
        const formattedStart = formatValue(start);
        const formattedEnd = formatValue(end);
        return `"${filter.column}" BETWEEN ${formattedStart} AND ${formattedEnd}`;
      }

      const value = filter.value[0];

      // Handle case-insensitive LIKE
      if (filter.operator === FilterOperator.LIKE) {
        return `"${filter.column}" ILIKE '%${escapeSingleQuotes(value)}%'`;
      }

      if (value.toLowerCase() === 'null') {
        // API returns null values as empty strings
        return `"${filter.column}" = ''`;
      }

      const formattedValue = formatValue(value);
      return `"${filter.column}" ${filter.operator} ${formattedValue}`;
    })
    .join(' AND ');
