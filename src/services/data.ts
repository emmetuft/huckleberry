import { Column } from 'models/interfaces/column';
import { DataSource } from 'models/interfaces/dataSource';
import {
  commonHeaders,
  getDatasetRequestBody,
  handleResponse,
} from 'utils/service';

const DATA_SOURCES_URL = '/api/datasources';

interface FetchDataSourcesInput {
  page: number;
  size: number;
  searchTerm?: string;
}

const fetchDataSources = async ({
  page,
  size,
  searchTerm,
}: FetchDataSourcesInput): Promise<{
  sources: DataSource[];
  total: number;
}> => {
  try {
    const response = await fetch(
      `${DATA_SOURCES_URL}?offset=${(page - 1) * size}&limit=${size}${searchTerm ? `&nameLike=${encodeURIComponent(searchTerm)}` : ''}`,
    );
    const data = await handleResponse<{
      dataSources: any[];
      _metaData: any;
    }>(response);
    return {
      sources: data.dataSources,
      total: data._metaData.totalCount,
    };
  } catch (error: any) {
    throw error;
  }
};

const fetchDataSource = async (
  dataSourceId: string,
): Promise<{ dataSource: DataSource; columns: Column[] }> => {
  try {
    const response = await fetch(`${DATA_SOURCES_URL}/${dataSourceId}/schema`);
    const data = await handleResponse<{
      dataSource: any;
      schemaContract: any;
    }>(response);
    return {
      dataSource: data.dataSource,
      columns: data.schemaContract.schema.columns,
    };
  } catch (error: any) {
    throw error;
  }
};

interface FetchDataParams {
  dataSourceId: string;
  schema: Column[];
  page: number;
  pageSize: number;
}

const fetchDataSourceRows = async ({
  dataSourceId,
  schema,
  page,
  pageSize,
}: FetchDataParams) => {
  const columnNames = schema.map((column) => column.name);

  const requestBody = getDatasetRequestBody(columnNames);

  const url = `${DATA_SOURCES_URL}/${dataSourceId}/data?page=${page - 1}&size=${pageSize}`;
  const options = {
    method: 'POST',
    headers: commonHeaders(),
    body: JSON.stringify(requestBody),
  };

  const response = await fetch(url, options);
  if (response.ok) {
    const result = await response.json();
    const datasetResponse = result.data ?? result;
    const dataContent = datasetResponse.rows;
    const datasetRows = formatRowsWithKeys(schema, dataContent);
    return datasetRows;
  }

  throw new Error('Failed to load dataset data');
};

const formatRowsWithKeys = (schema: Column[], rows: string[][]) =>
  rows.map((row) => {
    const rowObj: any = {};
    schema.forEach((column, index) => {
      rowObj[column.name] = row[index];
    });
    return rowObj;
  });

export const DataService = {
  fetchDataSources,
  fetchDataSource,
  fetchDataSourceRows,
};
