import { DataSource } from 'models/interfaces/dataSource';

const DataSourcesUrl = '/domo/datasources/v1';

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
      console.log(result);
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
  const urlBuilder = new URL(DataSourcesUrl, window.location.href);
  urlBuilder.searchParams.append('offset', ((page - 1) * size).toString());
  urlBuilder.searchParams.append('limit', size.toString());
  if (searchTerm !== undefined && searchTerm !== null && searchTerm !== '') {
    urlBuilder.searchParams.append('nameLike', searchTerm.toLowerCase());
  }
  return urlBuilder.href;
};

export const DataService = {
  fetchDataSources,
};
