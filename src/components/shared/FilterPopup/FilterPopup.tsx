import { FC, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import {
  Select,
  Button,
  Space,
  DatePicker,
  Input,
  InputNumber,
  Cascader,
} from 'antd';
import { PlusIcon, TrashSimpleIcon } from '@phosphor-icons/react';
import styles from './FilterPopup.module.css';
import {
  Filter,
  FilterColumn,
  FilterDataType,
  FilterOperator,
  operatorLabelMap,
  operatorsByType,
} from 'models/interfaces/filter';

const { RangePicker } = DatePicker;

const NO_VALUE_OPERATORS = new Set<FilterOperator>([
  FilterOperator.IS_NULL,
  FilterOperator.IS_NOT_NULL,
]);

type FilterDraft = Omit<Filter, 'operator'> & { operator: FilterOperator | '' };

interface FilterPopupProps {
  columns: FilterColumn[];
  initialFilters?: Filter[];
  onApply: (filters: Filter[]) => void;
  onLoadOptions?: (
    columnKey: string,
  ) => Promise<{ label: string; value: any }[]>;
  emptyStateMessage?: string;
}

export const FilterPopup: FC<FilterPopupProps> = ({
  columns,
  initialFilters = [],
  onApply,
  onLoadOptions,
  emptyStateMessage = 'No filters added.',
}) => {
  const [filters, setFilters] = useState<FilterDraft[]>(initialFilters);
  const [loadedOptions, setLoadedOptions] = useState<
    Record<string, { label: string; value: any }[]>
  >({});

  const getColumnDef = (key: string) => columns.find((c) => c.key === key);

  const handleColumnChange = (id: string, columnKey: string) => {
    updateFilter(id, { column: columnKey });

    if (!onLoadOptions || !columnKey) return;
    if (loadedOptions[columnKey] !== undefined) return;

    const col = getColumnDef(columnKey);
    if (
      !col ||
      col.type === FilterDataType.NUMBER ||
      col.type === FilterDataType.DATE
    )
      return;

    setLoadedOptions((prev) => ({ ...prev, [columnKey]: [] }));
    onLoadOptions(columnKey)
      .then((options) =>
        setLoadedOptions((prev) => ({ ...prev, [columnKey]: options })),
      )
      .catch(() => {});
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      { id: uuidv4(), column: '', operator: '', value: null },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterDraft>) => {
    setFilters(
      filters.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, ...updates };
        if (updates.column !== undefined && updates.column !== f.column) {
          return { ...updated, operator: '', value: null };
        }
        if (updates.operator !== undefined && updates.operator !== f.operator) {
          return { ...updated, value: null };
        }
        return updated;
      }),
    );
  };

  const getColumnOptions = (columnKey: string) => {
    const col = getColumnDef(columnKey);
    if (col?.options?.length) return col.options;
    const loaded = loadedOptions[columnKey];
    return loaded?.length ? loaded : undefined;
  };

  const getOperatorOptions = (columnKey: string) => {
    const col = getColumnDef(columnKey);
    if (!col) return [];
    const ops = operatorsByType[col.type];
    if (getColumnOptions(columnKey)) {
      return ops.filter(
        (op) => op !== FilterOperator.LIKE && op !== FilterOperator.NOT_LIKE,
      );
    }
    return ops;
  };

  const renderValueInput = (filter: FilterDraft) => {
    const dataType = getColumnDef(filter.column)?.type ?? FilterDataType.STRING;

    const colOptions = getColumnOptions(filter.column);
    if (colOptions) {
      return (
        <Select
          style={{ width: '100%' }}
          showSearch
          placeholder="Select value"
          value={filter.value ?? undefined}
          onChange={(value) => updateFilter(filter.id, { value })}
          options={colOptions}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      );
    }

    switch (dataType) {
      case FilterDataType.DATE:
        if (filter.operator === FilterOperator.BETWEEN) {
          return (
            <RangePicker
              style={{ width: '100%' }}
              value={
                filter.value
                  ? [dayjs(filter.value[0]), dayjs(filter.value[1])]
                  : null
              }
              onChange={(dates) =>
                updateFilter(filter.id, {
                  value: dates ? [dates[0], dates[1]] : null,
                })
              }
              format="MM/DD/YYYY"
            />
          );
        }
        return (
          <DatePicker
            style={{ width: '100%' }}
            value={filter.value ? dayjs(filter.value) : null}
            onChange={(date) =>
              updateFilter(filter.id, { value: date?.toISOString() ?? null })
            }
            format="MM/DD/YYYY"
          />
        );

      case FilterDataType.NUMBER:
        if (filter.operator === FilterOperator.BETWEEN) {
          return (
            <Space.Compact>
              <InputNumber
                placeholder="Min"
                value={filter.value?.[0]}
                onChange={(val) => {
                  const current = filter.value || [null, null];
                  updateFilter(filter.id, { value: [val, current[1]] });
                }}
                style={{ width: '50%' }}
              />
              <InputNumber
                placeholder="Max"
                value={filter.value?.[1]}
                onChange={(val) => {
                  const current = filter.value || [null, null];
                  updateFilter(filter.id, { value: [current[0], val] });
                }}
                style={{ width: '50%' }}
              />
            </Space.Compact>
          );
        }
        return (
          <InputNumber
            value={filter.value}
            onChange={(val) => updateFilter(filter.id, { value: val })}
          />
        );

      case FilterDataType.BOOLEAN:
        return (
          <Select
            value={filter.value}
            onChange={(val) => updateFilter(filter.id, { value: val })}
            options={[
              { label: 'True', value: true },
              { label: 'False', value: false },
            ]}
          />
        );

      default:
        return (
          <Input
            value={filter.value ?? ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
          />
        );
    }
  };

  const handleApply = () => {
    const valid = filters.filter(
      (f) =>
        f.column &&
        f.operator &&
        (NO_VALUE_OPERATORS.has(f.operator as FilterOperator) ||
          (f.value !== null && f.value !== '')),
    ) as Filter[];
    onApply(valid);
  };

  const handleClear = () => {
    setFilters([]);
    onApply([]);
  };

  const hasGroups = columns.some((c) => c.group);

  const cascaderOptions = hasGroups
    ? Array.from(
        columns.reduce((groups, col) => {
          const group = col.group ?? '';
          if (!groups.has(group)) groups.set(group, []);
          groups.get(group)!.push(col);
          return groups;
        }, new Map<string, FilterColumn[]>()),
      ).map(([group, cols]) => ({
        value: group,
        label: group,
        children: cols.map((c) => ({ value: c.label, label: c.label })),
      }))
    : [];

  const flatSelectOptions = hasGroups
    ? []
    : columns.map((c) => ({ label: c.label, value: c.key }));

  const getCascaderValue = (columnKey: string): string[] | undefined => {
    if (!columnKey) return undefined;
    const col = getColumnDef(columnKey);
    return col?.group ? [col.group, col.label] : undefined;
  };

  return (
    <div className={styles.filterPopup}>
      <div className={styles.filterList}>
        {filters.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{emptyStateMessage}</p>
          </div>
        ) : (
          filters.map((filter) => (
            <div key={filter.id} className={styles.filterRow}>
              {hasGroups ? (
                <Cascader
                  className={styles.filterRowItem}
                  placeholder="Select label and property"
                  options={cascaderOptions}
                  value={getCascaderValue(filter.column)}
                  onChange={(value) =>
                    handleColumnChange(
                      filter.id,
                      value?.length === 2 ? `${value[0]}:${value[1]}` : '',
                    )
                  }
                />
              ) : (
                <Select
                  className={styles.filterRowItem}
                  placeholder="Select column"
                  showSearch
                  value={filter.column || undefined}
                  onChange={(value) => handleColumnChange(filter.id, value)}
                  options={flatSelectOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              )}

              <Select
                className={styles.filterRowItem}
                placeholder="Operator"
                value={filter.operator || undefined}
                onChange={(value) =>
                  updateFilter(filter.id, { operator: value })
                }
                options={getOperatorOptions(filter.column).map((op) => ({
                  label: operatorLabelMap[op],
                  value: op,
                }))}
                disabled={!filter.column}
              />

              <div className={styles.filterRowItem}>
                {renderValueInput(filter)}
              </div>

              <Button
                type="text"
                danger
                icon={<TrashSimpleIcon />}
                onClick={() => removeFilter(filter.id)}
              />
            </div>
          ))
        )}
      </div>

      <div>
        <Button type="dashed" icon={<PlusIcon />} onClick={addFilter} block>
          Add Filter
        </Button>

        <Space
          style={{ marginTop: 12, width: '100%', justifyContent: 'flex-end' }}
        >
          <Button onClick={handleClear}>Clear All</Button>
          <Button type="primary" onClick={handleApply}>
            Apply Filters
          </Button>
        </Space>
      </div>
    </div>
  );
};
