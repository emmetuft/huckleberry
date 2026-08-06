import { InputType } from 'models/enums/inputType';
import {
  FieldOption,
  InputField,
} from 'components/shared/LabelInput/LabelInput';
import { CreateMetricPayload, Metric } from 'models/interfaces/metric';

export const DATE_GRAIN_OPTIONS: FieldOption[] = [
  { label: 'Day', value: 'DAY' },
  { label: 'Week', value: 'WEEK' },
  { label: 'Month', value: 'MONTH' },
  { label: 'Quarter', value: 'QUARTER' },
  { label: 'Year', value: 'YEAR' },
];

export const CALENDAR_TYPE_OPTIONS: FieldOption[] = [
  { label: 'Standard', value: 'STANDARD' },
  { label: 'Fiscal', value: 'FISCAL' },
];

export const CUMULATIVE_TYPE_OPTIONS: FieldOption[] = [
  { label: 'Non-cumulative', value: 'NON_CUMULATIVE' },
  { label: 'Running total', value: 'RUNNING_TOTAL' },
];

export const AGGREGATION_FUNCTION_OPTIONS: FieldOption[] = [
  { label: 'Sum', value: 'SUM' },
  { label: 'Average', value: 'AVG' },
  { label: 'Count', value: 'COUNT' },
  { label: 'Min', value: 'MIN' },
  { label: 'Max', value: 'MAX' },
  { label: 'Count (distinct)', value: 'COUNT_DISTINCT' },
  { label: 'Sum (distinct)', value: 'SUM_DISTINCT' },
  { label: 'Beast mode', value: 'DOMO_BEAST_MODE' },
];

// Allowed values for static enum fields — used to reject hallucinated AI values at merge time.
export const ENUM_FIELD_ALLOWED: Record<string, string[]> = {
  preferredDateGrain: DATE_GRAIN_OPTIONS.map((o) => String(o.value)),
  calendarType: CALENDAR_TYPE_OPTIONS.map((o) => String(o.value)),
  cumulativeType: CUMULATIVE_TYPE_OPTIONS.map((o) => String(o.value)),
  aggregationFunction: AGGREGATION_FUNCTION_OPTIONS.map((o) => String(o.value)),
};

/**
 * Flattened form shape. `aggregation` is flattened into three fields for the
 * form + AI-fill; reassembled into the nested payload on submit.
 */
export interface MetricFormValues {
  name: string;
  description?: string;
  datasourceId?: string;
  dateColumn?: string;
  preferredDateGrain?: string;
  calendarType?: string;
  cumulativeType?: string;
  dimensions?: string[];
  aggregationFunction?: string;
  aggregationValue?: string;
  aggregationAlias?: string;
  tags?: string[];
}

export const EMPTY_METRIC_FORM: MetricFormValues = {
  name: '',
  description: '',
  datasourceId: undefined,
  dateColumn: undefined,
  preferredDateGrain: 'MONTH',
  calendarType: 'STANDARD',
  cumulativeType: 'NON_CUMULATIVE',
  dimensions: [],
  aggregationFunction: undefined,
  aggregationValue: undefined,
  aggregationAlias: undefined,
  tags: [],
};

/**
 * Field config that drives both the rendered form (via LabelInput) and the
 * per-field "Generate with AI" affordance. Fields whose options are dynamic
 * (datasource, columns) declare no static options — the modal injects them.
 */
export const METRIC_FORM_FIELDS: InputField<keyof MetricFormValues>[] = [
  {
    key: 'name',
    label: 'Name',
    inputType: InputType.Text,
    description: 'A recognizable name for this metric',
  },
  {
    key: 'description',
    label: 'Description',
    inputType: InputType.TextArea,
    description: 'What this metric measures and when to use it',
    inputProps: { autoSize: { minRows: 2 } },
  },
  {
    key: 'datasourceId',
    label: 'Datasource',
    inputType: InputType.Select,
    description: 'The dataset this metric aggregates over',
  },
  {
    key: 'aggregationFunction',
    label: 'Aggregation',
    inputType: InputType.Select,
    description: 'How the measure column is aggregated',
    options: AGGREGATION_FUNCTION_OPTIONS,
    halfWidth: true,
  },
  {
    key: 'aggregationValue',
    label: 'Measure column',
    inputType: InputType.Select,
    description: 'Column (or beast-mode id) that is aggregated',
    halfWidth: true,
  },
  {
    key: 'aggregationAlias',
    label: 'Measure label',
    inputType: InputType.Text,
    description: 'Optional display label for the aggregated value',
  },
  {
    key: 'dimensions',
    label: 'Dimensions',
    inputType: InputType.Tags,
    description: 'Columns to group by',
  },
  {
    key: 'dateColumn',
    label: 'Date column',
    inputType: InputType.Select,
    description: 'Column used for time-series',
    halfWidth: true,
  },
  {
    key: 'preferredDateGrain',
    label: 'Date grain',
    inputType: InputType.Select,
    description: 'Default time granularity',
    options: DATE_GRAIN_OPTIONS,
    halfWidth: true,
  },
  {
    key: 'calendarType',
    label: 'Calendar',
    inputType: InputType.Select,
    description: 'Standard or fiscal calendar',
    options: CALENDAR_TYPE_OPTIONS,
    halfWidth: true,
  },
  {
    key: 'cumulativeType',
    label: 'Cumulative',
    inputType: InputType.Select,
    description: 'Whether the metric is cumulative or not',
    options: CUMULATIVE_TYPE_OPTIONS,
    halfWidth: true,
  },
  {
    key: 'tags',
    label: 'Tags',
    inputType: InputType.Tags,
    description: 'Optional labels for discovery',
  },
];

/** System prompt for the "Try with AI" fill-all: returns a MetricFormValues JSON object. */
export const METRIC_AI_FILL_SYSTEM = `You help configure a Domo Metric — a saved, structured aggregation over a dataset (NOT a raw SQL query).
You will be given the dataset schema (column names with their data types: DATE, DATETIME, DECIMAL, DOUBLE, LONG, STRING) and optionally a few sample rows.
Use the schema and sample data to infer appropriate columns for aggregation, date, and dimensions.
Produce a JSON object with these optional keys:
name (string), description (string), aggregationFunction (one of SUM, AVG, COUNT, MIN, MAX, COUNT_DISTINCT, SUM_DISTINCT, DOMO_BEAST_MODE),
aggregationValue (a column name to aggregate — prefer DECIMAL/DOUBLE/LONG columns for SUM/AVG), aggregationAlias (string),
dimensions (array of column names to group by — prefer STRING columns),
dateColumn (a DATE or DATETIME column name), preferredDateGrain (one of DAY, WEEK, MONTH, QUARTER, YEAR), calendarType (STANDARD or FISCAL),
cumulativeType (NON_CUMULATIVE or RUNNING_TOTAL), tags (array of short strings).
Only use column names that appear in the schema. Omit keys you cannot infer. Respond ONLY with the raw JSON object, no surrounding text.`;

/** Populate the form from an existing metric (unflatten aggregation). */
export const fromMetric = (metric: Metric): MetricFormValues => ({
  name: metric.name,
  description: metric.description ?? '',
  datasourceId: metric.datasourceId,
  dateColumn: metric.dateColumn,
  preferredDateGrain: metric.preferredDateGrain,
  calendarType: metric.calendarType,
  cumulativeType: metric.cumulativeType,
  dimensions: metric.dimensions ?? [],
  aggregationFunction: metric.aggregation?.function,
  aggregationValue: metric.aggregation?.value,
  aggregationAlias: metric.aggregation?.alias,
  tags: metric.tags ?? [],
});

/** Reassemble the flattened form into the API payload. */
export const toCreateMetricPayload = (
  values: MetricFormValues,
): CreateMetricPayload => {
  const payload: CreateMetricPayload = {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    datasourceId: values.datasourceId || undefined,
    dateColumn: values.dateColumn || undefined,
    preferredDateGrain:
      values.preferredDateGrain as CreateMetricPayload['preferredDateGrain'],
    calendarType: values.calendarType as CreateMetricPayload['calendarType'],
    cumulativeType:
      values.cumulativeType as CreateMetricPayload['cumulativeType'],
    dimensions: values.dimensions?.length ? values.dimensions : undefined,
    tags: values.tags?.length ? values.tags : undefined,
  };

  if (values.aggregationFunction && values.aggregationValue) {
    payload.aggregation = {
      function: values.aggregationFunction,
      value: values.aggregationValue,
      alias: values.aggregationAlias || values.aggregationValue,
    };
  }

  return payload;
};
