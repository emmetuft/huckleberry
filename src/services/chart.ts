import { SqlClient, SqlResponse } from '@domoinc/toolkit';
import { Filter } from 'models/interfaces/filter';

interface DataSourceParams {
  schema: string[];
  alias: string;
  customSelect?: string;
  filters?: Filter[];
  groupBy?: string[];
  orderBy?: string[];
  limit?: number;
}

const fetchDataSource = async ({
  schema,
  alias,
  customSelect,
  filters,
  groupBy,
  orderBy,
  limit,
}: DataSourceParams): Promise<Record<string, any>[]> => {
  const query = `
    SELECT ${customSelect ?? schema.join(', ')}
    FROM ${alias}
    ${buildWhereClause(filters)}
    ${groupBy ? `GROUP BY ${groupBy.join(', ')}` : ''}
    ${orderBy ? `ORDER BY ${orderBy.join(', ')}` : ''}
    ${limit ? `LIMIT ${limit}` : ''}
  `;

  const { data: result } = await new SqlClient().get(alias, query);
  const mappedData = parseSqlResult(result, schema);
  return mappedData;
};

const buildWhereClause = (filters?: Filter[]): string => {
  if (!filters || filters.length === 0) return '';

  const conditions = filters.map((filter) => {
    let filterValue = filter.value;
    if (Array.isArray(filter.value)) {
      filterValue = `(${filter.value.map((val) => (typeof val === 'string' ? `'${val}'` : val)).join(', ')})`;
    } else if (typeof filter.value === 'string') {
      filterValue = `'${filter.value}'`;
    }
    return `"${filter.column}" ${filter.operator} ${filterValue}`;
  });

  return `WHERE ${conditions.join(' AND ')}`;
};

const parseSqlResult = (data: SqlResponse, schema: string[]) => {
  const rowData = data.rows.map((row) =>
    row.reduce(
      (acc, next, i) => {
        acc[schema[i]] = next;
        return acc;
      },
      {} as { [key: string]: string },
    ),
  );
  return rowData;
};

export const ChartService = {
  fetchDataSource,
};
