// Mirrors the Huckleberry BFF Metrics API (/api/metrics -> Domo /api/content/v1/metrics).
// A Metric is a saved, structured aggregation over a datasource — NOT a raw SQL query.

export type DateGrain = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
export type CalendarType = 'STANDARD' | 'FISCAL';
export type CumulativeType = 'RUNNING_TOTAL' | 'NON_CUMULATIVE';

export type AggregationFunction =
  | 'SUM'
  | 'AVG'
  | 'COUNT'
  | 'MIN'
  | 'MAX'
  | 'SUM_DISTINCT'
  | 'AVG_DISTINCT'
  | 'COUNT_DISTINCT'
  | 'MIN_DISTINCT'
  | 'MAX_DISTINCT'
  | 'DOMO_BEAST_MODE';

export interface Aggregation {
  /** Left open (string) so DISTINCT variants / DOMO_BEAST_MODE aren't rejected. */
  function: AggregationFunction | string;
  /** Column name, or a beast-mode id (e.g. "4022") when function is DOMO_BEAST_MODE. */
  value: string;
  alias?: string;
}

/** Request body for POST /api/metrics. Complex fields (filters, dateRangeFilter)
 * are opaque passthrough — Domo is the source of truth for their JSqlParser shape. */
export interface CreateMetricPayload {
  name: string;
  description?: string;
  datasourceId?: string;
  tags?: string[];
  dateColumn?: string;
  preferredDateGrain?: DateGrain;
  calendarType?: CalendarType;
  cumulativeType?: CumulativeType;
  dimensions?: string[];
  aggregation?: Aggregation;
  filters?: unknown[];
  aggregatedFilters?: unknown[];
  legacyFilters?: unknown[];
  dateRangeFilter?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  format?: Record<string, unknown>;
}

/** Full metric as returned by GET. Adds server-managed + computed fields. */
export interface Metric extends CreateMetricPayload {
  id: number;
  owner?: number;
  ownerDisplayName?: string;
  dataSourceName?: string;
  datasetDateGrain?: DateGrain;
  created?: number;
  modified?: number;
  // Server-computed round-trip fields — opaque, carried back verbatim on update.
  dateColumnExpression?: unknown;
  dimensionExpressions?: Record<string, unknown>;
  dimensionExpressionsByName?: Record<string, unknown>;
  sqlFilters?: unknown[];
  aggregatedSqlFilters?: unknown[];
}
