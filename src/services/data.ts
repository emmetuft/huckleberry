import { Column } from 'models/interfaces/column';
import { DataSource } from 'models/interfaces/dataSource';
import { commonHeaders, getDatasetRequestBody } from 'utils/service';

const DATA_SOURCES_URL = '/domo/datasources/v1';
const SCHEMA_URL = '/domo/datasources/v1/{id}/schema';

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
    const apiUrl = buildDatasetQuery(page, size, searchTerm);
    const response = await fetch(apiUrl);
    if (response.ok) {
      const result = await response.json();
      return {
        sources: result.dataSources,
        total: result._metaData.totalCount,
      };
    }
    return {
      sources: [],
      total: 0,
    };
  } catch (error: any) {
    throw error;
  }
};

const buildDatasetQuery = (
  page: number,
  size: number,
  searchTerm: string | undefined,
) => {
  const urlBuilder = new URL(DATA_SOURCES_URL, window.location.href);
  urlBuilder.searchParams.append('offset', ((page - 1) * size).toString());
  urlBuilder.searchParams.append('limit', size.toString());
  if (searchTerm !== undefined && searchTerm !== null && searchTerm !== '') {
    urlBuilder.searchParams.append('nameLike', searchTerm.toLowerCase());
  }
  return urlBuilder.href;
};

const fetchDataSourceSchema = async (
  dataSourceId: string,
): Promise<Column[]> => {
  try {
    const response = await fetch(SCHEMA_URL.replace('{id}', dataSourceId));
    if (response.ok) {
      const result = await response.json();
      console.log(result);
      return result.columnList;
    }
    return [];
  } catch (error: any) {
    throw error;
  }
};

const fetchSampleRows = async (dataSourceId: string, schema: Column[]) => {
  const columnNames = schema.map((column) => column.name);

  const requestBody = getDatasetRequestBody(columnNames);

  const url = `https://domo-service.labsprod.domotech.io/api/v2/domo/datasets/${dataSourceId}/data?page=0&size=3`;
  const options = {
    method: 'POST',
    headers: commonHeaders(),
    body: JSON.stringify(requestBody),
  };

  const response = await fetch(url, options);
  if (response.ok) {
    const datasetResponse = await response.json();
    const dataContent = datasetResponse.content;
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
  fetchDataSourceSchema,
  fetchSampleRows,
};
