import { createAsyncThunk } from '@reduxjs/toolkit';
import { metricCatalogDatasourceId } from 'constants/metrics';
import { DataService } from 'services/data';

export const fetchMetricCatalogSchema = createAsyncThunk(
  'metrics/fetchSchema',
  async () => {
    return await DataService.fetchDataSourceSchema(metricCatalogDatasourceId);
  },
);
