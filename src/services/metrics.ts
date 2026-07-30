import { apiFetch } from 'services/headers';
import { handleResponse } from 'utils/service';
import { CreateMetricPayload, Metric } from 'models/interfaces/metric';

const METRICS_API = '/api/metrics';

const listMetrics = async (): Promise<Metric[]> => {
  const response = await apiFetch(METRICS_API, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Metric[]>(response);
};

const getMetric = async (id: number): Promise<Metric> => {
  const response = await apiFetch(`${METRICS_API}/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Metric>(response);
};

const createMetric = async (payload: CreateMetricPayload): Promise<Metric> => {
  const response = await apiFetch(METRICS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Metric>(response);
};

const updateMetric = async (
  id: number,
  payload: Partial<Metric>,
): Promise<Metric> => {
  const response = await apiFetch(`${METRICS_API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Metric>(response);
};

export const MetricService = {
  listMetrics,
  getMetric,
  createMetric,
  updateMetric,
};
