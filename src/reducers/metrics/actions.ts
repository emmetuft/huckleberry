import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { MetricService } from 'services/metrics';
import { CreateMetricPayload, Metric } from 'models/interfaces/metric';

export const fetchMetrics = createAsyncThunk<
  Metric[],
  void,
  { state: RootState }
>('metrics/fetchMetrics', async () => MetricService.listMetrics());

export const createMetric = createAsyncThunk<
  Metric,
  CreateMetricPayload,
  { state: RootState }
>('metrics/createMetric', async (payload) =>
  MetricService.createMetric(payload),
);

export const updateMetric = createAsyncThunk<
  Metric,
  { id: number; payload: CreateMetricPayload },
  { state: RootState }
>('metrics/updateMetric', async ({ id, payload }) =>
  MetricService.updateMetric(id, payload),
);
