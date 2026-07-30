import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { MagicWandIcon } from '@phosphor-icons/react';
import { Column } from 'models/interfaces/column';
import styles from './SaveMetricModal.module.css';
import { InputType } from 'models/enums/inputType';
import { isDateType } from 'models/enums/dataType';
import { Metric } from 'models/interfaces/metric';
import {
  EMPTY_METRIC_FORM,
  ENUM_FIELD_ALLOWED,
  METRIC_AI_FILL_SYSTEM,
  METRIC_FORM_FIELDS,
  MetricFormValues,
  fromMetric,
  toCreateMetricPayload,
} from 'constants/metric';
import {
  FieldOption,
  InputField,
  LabelInput,
} from 'components/shared/LabelInput/LabelInput';
import AppTooltip from 'components/shared/Tooltip';
import { DomoAIService } from 'services/ai';
import { DataService } from 'services/data';
import { buildFieldGenerationPrompt } from 'utils/ai';
import { useAppDispatch } from 'reducers';
import { createMetric, updateMetric } from 'reducers/metrics/actions';

interface SaveMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (metric: Metric) => void;
  /** When set, the modal opens in edit mode pre-populated from this metric. */
  metric?: Metric;
  /** Seed values for create mode only (e.g. a datasourceId from the current turn). */
  initialValues?: Partial<MetricFormValues>;
}

// Fields excluded from per-field AI generation: name (user-owned), datasourceId
// (a UUID the model can't infer), and tag-style fields (covered by "Try with AI").
const AI_SKIP_FIELDS = new Set<keyof MetricFormValues>([
  'name',
  'datasourceId',
  'dimensions',
  'tags',
]);

const AI_FILL_KEYS: (keyof MetricFormValues)[] = [
  'name',
  'description',
  'aggregationFunction',
  'aggregationValue',
  'aggregationAlias',
  'dimensions',
  'dateColumn',
  'preferredDateGrain',
  'calendarType',
  'cumulativeType',
  'tags',
];

const mergeSuggestion = (
  current: MetricFormValues,
  suggestion: Partial<MetricFormValues>,
): MetricFormValues => {
  const next = { ...current };
  for (const key of AI_FILL_KEYS) {
    const val = suggestion[key];
    if (val === undefined || val === null) continue;
    if (key === 'dimensions' || key === 'tags') {
      next[key] = Array.isArray(val) ? (val as string[]) : [String(val)];
    } else {
      const allowed = ENUM_FIELD_ALLOWED[key];
      if (allowed && !allowed.includes(String(val))) continue;
      (next[key] as unknown) = val;
    }
  }
  return next;
};

export const SaveMetricModal: FC<SaveMetricModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  metric,
  initialValues,
}) => {
  const isEditing = !!metric;
  const dispatch = useAppDispatch();

  const [values, setValues] = useState<MetricFormValues>(EMPTY_METRIC_FORM);
  const [datasourceOptions, setDatasourceOptions] = useState<FieldOption[]>([]);
  const [dsOptionsLoading, setDsOptionsLoading] = useState(false);
  const [columnOptions, setColumnOptions] = useState<FieldOption[]>([]);
  const dsSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [schema, setSchema] = useState<Column[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const dateColumnOptions = useMemo(
    () =>
      schema
        .filter((c) => isDateType(c.type))
        .map((c) => ({
          label: `${c.name} (${c.type.toLowerCase()})`,
          value: c.name,
        })),
    [schema],
  );
  const noDateColumns =
    !!values.datasourceId &&
    !schemaLoading &&
    schema.length > 0 &&
    dateColumnOptions.length === 0;
  const [generatingFields, setGeneratingFields] = useState<
    Set<keyof MetricFormValues>
  >(new Set());
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFilling, setAiFilling] = useState(false);
  const [saving, setSaving] = useState(false);

  const aiReady = !!values.datasourceId && !schemaLoading;

  // On open: reset the form and load selectable datasources.
  useEffect(() => {
    if (!isOpen) return;
    setValues(
      metric ? fromMetric(metric) : { ...EMPTY_METRIC_FORM, ...initialValues },
    );
    setAiPrompt('');
    setDsOptionsLoading(true);
    DataService.getDataSources({ page: 1, size: 50 })
      .then(({ sources }) =>
        setDatasourceOptions(
          sources.map((s) => ({ label: s.name, value: s.id })),
        ),
      )
      .catch(() => setDatasourceOptions([]))
      .finally(() => setDsOptionsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // When a datasource is chosen, load schema + sample rows for column dropdowns and AI context.
  useEffect(() => {
    if (!values.datasourceId) {
      setColumnOptions([]);
      setSchema([]);
      setSampleRows([]);
      return;
    }
    let active = true;
    setSchemaLoading(true);
    setSchema([]);
    setSampleRows([]);
    DataService.getDataSource(values.datasourceId)
      .then(({ columns }) => {
        if (!active) return;
        setSchema(columns);
        setColumnOptions(
          columns.map((c) => ({
            label: `${c.name} (${c.type.toLowerCase()})`,
            value: c.name,
          })),
        );
        setSchemaLoading(false);
        // Best-effort sample rows — non-blocking, failure is silent.
        DataService.getDataSourceRows({
          dataSourceId: values.datasourceId!,
          schema: columns,
          page: 1,
          pageSize: 5,
        })
          .then((rows) => {
            if (active) setSampleRows(rows);
          })
          .catch(() => {});
      })
      .catch(() => {
        if (active) {
          setColumnOptions([]);
          setSchemaLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [values.datasourceId]);

  const buildDatasourceContext = useCallback((): string => {
    if (!schema.length) return '';
    const schemaBlock = `Dataset schema: ${schema.map((c) => `${c.name} (${c.type})`).join(', ')}`;
    if (!sampleRows.length) return schemaBlock;
    const trimmed = sampleRows
      .slice(0, 3)
      .map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, String(v).slice(0, 60)]),
        ),
      );
    return `${schemaBlock}\n\nSample rows:\n${trimmed.map((r) => JSON.stringify(r)).join('\n')}`;
  }, [schema, sampleRows]);

  const onDatasourceSearch = useCallback((term: string) => {
    if (dsSearchTimer.current) clearTimeout(dsSearchTimer.current);
    dsSearchTimer.current = setTimeout(() => {
      setDsOptionsLoading(true);
      DataService.getDataSources({
        page: 1,
        size: 50,
        searchTerm: term || undefined,
      })
        .then(({ sources }) =>
          setDatasourceOptions(
            sources.map((s) => ({ label: s.name, value: s.id })),
          ),
        )
        .catch(() => {})
        .finally(() => setDsOptionsLoading(false));
    }, 300);
  }, []);

  const setField = (key: keyof MetricFormValues, val: unknown) =>
    setValues((v) => ({ ...v, [key]: val }));

  const optionsForField = (
    field: InputField<keyof MetricFormValues>,
  ): FieldOption[] | undefined => {
    if (field.key === 'datasourceId') return datasourceOptions;
    if (field.key === 'dateColumn') return dateColumnOptions;
    if (field.key === 'aggregationValue' || field.key === 'dimensions')
      return columnOptions;
    return field.options;
  };

  const handleGenerateField = async (
    field: InputField<keyof MetricFormValues>,
    options?: FieldOption[],
  ) => {
    setGeneratingFields((prev) => new Set(prev).add(field.key));
    try {
      const fieldContext = METRIC_FORM_FIELDS.filter(
        (f) =>
          f.key !== field.key && values[f.key] && !Array.isArray(values[f.key]),
      )
        .map((f) => `${f.label}: ${String(values[f.key])}`)
        .join('\n');
      const context = [fieldContext, buildDatasourceContext()]
        .filter(Boolean)
        .join('\n\n');

      const { system, input } = buildFieldGenerationPrompt(
        field.label,
        field.description ?? '',
        context,
        options,
      );
      const result = await DomoAIService.generateText<string>({
        system,
        input,
      });
      if (typeof result === 'string') setField(field.key, result.trim());
    } catch (error) {
      console.error('Failed to generate field with AI:', error);
      message.error('Could not generate content. Please try again.');
    } finally {
      setGeneratingFields((prev) => {
        const next = new Set(prev);
        next.delete(field.key);
        return next;
      });
    }
  };

  const handleTryWithAI = async () => {
    setAiFilling(true);
    try {
      const request =
        aiPrompt.trim() ||
        values.description?.trim() ||
        values.name?.trim() ||
        'Suggest a useful metric for this dataset.';
      const input = `User request: ${request}\n\n${buildDatasourceContext()}`;
      const suggestion = await DomoAIService.generateText<
        Partial<MetricFormValues>
      >({ system: METRIC_AI_FILL_SYSTEM, input }, true);
      setValues((v) => mergeSuggestion(v, suggestion));
      message.success('Filled from AI — review the fields before saving.');
    } catch (error) {
      console.error('AI metric fill failed:', error);
      message.error('Could not generate a metric. Please try again.');
    } finally {
      setAiFilling(false);
    }
  };

  const handleClose = () => {
    setValues(EMPTY_METRIC_FORM);
    setAiPrompt('');
    onClose();
  };

  const handleSave = async () => {
    if (!values.name?.trim()) {
      message.error('Please enter a metric name');
      return;
    }
    if (!values.datasourceId) {
      message.error('Please select a datasource');
      return;
    }
    setSaving(true);
    try {
      const payload = toCreateMetricPayload(values);
      let result: Metric;
      if (isEditing) {
        result = await dispatch(
          updateMetric({ id: metric.id, payload }),
        ).unwrap();
        message.success('Metric updated.');
      } else {
        result = await dispatch(createMetric(payload)).unwrap();
        message.success('Metric saved.');
      }
      onSaved?.(result);
      handleClose();
    } catch (error) {
      console.error('Failed to save metric:', error);
      message.error(
        isEditing
          ? 'Failed to update metric. Please try again.'
          : 'Failed to save metric. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Metric' : 'Save as Metric'}
      open={isOpen}
      okText={isEditing ? 'Update' : 'Save'}
      onOk={handleSave}
      onCancel={handleClose}
      confirmLoading={saving}
      width={640}
    >
      <div className={styles.modalContent}>
        <p className={styles.description}>
          {isEditing
            ? 'Update this metric’s definition. Changes take effect immediately.'
            : 'Save a reusable, structured metric over a datasource. Fill the fields manually, generate individual fields with AI, or describe what you want and let AI draft the whole definition.'}
        </p>

        <div className={styles.aiBar}>
          <Input
            value={aiPrompt}
            placeholder="Describe the metric (e.g. average revenue by month)"
            onChange={(e) => setAiPrompt(e.target.value)}
            onPressEnter={aiReady ? handleTryWithAI : undefined}
            disabled={!aiReady}
          />
          <AppTooltip
            title={
              !values.datasourceId
                ? 'Select a datasource first'
                : schemaLoading
                  ? 'Loading schema…'
                  : undefined
            }
          >
            <Button
              icon={<MagicWandIcon />}
              loading={aiFilling}
              disabled={!aiReady}
              onClick={handleTryWithAI}
            >
              Try with AI
            </Button>
          </AppTooltip>
        </div>

        <div className={styles.fieldList}>
          {METRIC_FORM_FIELDS.map((field) => {
            const options = optionsForField(field);
            const isGenerating = generatingFields.has(field.key);
            const showMagic = !AI_SKIP_FIELDS.has(field.key);
            const isDateField =
              field.key === 'dateColumn' || field.key === 'preferredDateGrain';
            const value =
              values[field.key] ??
              (field.inputType === InputType.Tags ? [] : '');
            return (
              <div key={field.key} className={styles.fieldWrapper}>
                <LabelInput
                  inputType={field.inputType}
                  label={field.label}
                  description={field.description}
                  options={options}
                  inputProps={
                    field.key === 'datasourceId'
                      ? {
                          ...field.inputProps,
                          onSearch: onDatasourceSearch,
                          loading: dsOptionsLoading,
                          placeholder: 'Search datasources…',
                        }
                      : isDateField && noDateColumns
                        ? { ...field.inputProps, disabled: true }
                        : field.inputProps
                  }
                  value={value}
                  onChange={(val) => setField(field.key, val)}
                />
                {showMagic && aiReady && !noDateColumns && (
                  <AppTooltip title="Generate with AI" mouseEnterDelay={1}>
                    <Button
                      type="text"
                      shape="round"
                      icon={<MagicWandIcon />}
                      className={styles.magicIcon}
                      loading={isGenerating}
                      onClick={() => handleGenerateField(field, options)}
                    />
                  </AppTooltip>
                )}
                {field.key === 'preferredDateGrain' && noDateColumns && (
                  <p
                    style={{
                      gridColumn: '1 / -1',
                      margin: '2px 0 0',
                      fontSize: 12,
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    This datasource has no date columns — date grain is
                    unavailable.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
