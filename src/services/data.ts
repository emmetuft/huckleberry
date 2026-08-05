import { apiFetch } from 'services/headers';
import { Column } from 'models/interfaces/column';
import { DataSource } from 'models/interfaces/dataSource';
import {
  DataDictionary,
  DataDictionaryResult,
} from 'models/interfaces/dataDictionary';
import { getDatasetRequestBody, handleResponse } from 'utils/service';

const DATA_SOURCES_URL = '/api/datasources';

interface FetchDataSourcesInput {
  page: number;
  size: number;
  searchTerm?: string;
}

const getDataSources = async ({
  page,
  size,
  searchTerm,
}: FetchDataSourcesInput): Promise<{
  sources: DataSource[];
  total: number;
}> => {
  try {
    const response = await apiFetch(
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

const getDataSource = async (
  dataSourceId: string,
): Promise<{ dataSource: DataSource; columns: Column[] }> => {
  try {
    const response = await apiFetch(
      `${DATA_SOURCES_URL}/${dataSourceId}/schema`,
    );
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

const getDataDictionary = async (
  dataSourceId: string,
): Promise<DataDictionaryResult[]> => {
  try {
    const response = await apiFetch(
      `${DATA_SOURCES_URL}/${dataSourceId}/data-dictionary`,
    );
    return await handleResponse<DataDictionaryResult[]>(response);
  } catch (error: any) {
    throw error;
  }
};

const updateDataDictionary = async (
  dataSourceId: string,
  dataDictionary: DataDictionary,
): Promise<DataDictionaryResult> => {
  try {
    const response = await apiFetch(
      `${DATA_SOURCES_URL}/${dataSourceId}/data-dictionary`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataDictionary),
      },
    );
    return await handleResponse<DataDictionaryResult>(response);
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

const getDataSourceRows = async ({
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
    // Must be application/json — the BFF's body parser ignores text/plain
    // (fetch's default for a string body), which silently drops `columns`.
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  };

  const response = await apiFetch(url, options);
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
  getDataSources,
  getDataSource,
  getDataDictionary,
  updateDataDictionary,
  getDataSourceRows,
};
