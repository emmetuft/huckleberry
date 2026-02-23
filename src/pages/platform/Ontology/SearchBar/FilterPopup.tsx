import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './FilterPopup.module.scss';
import {
  selectLabelFilters,
  selectPropertyFilters,
} from 'reducers/ontology/slice';
import { DEFAULT_FILTER } from 'constants/filters';
import { VALUE_QUERY_LIMIT } from 'constants/service';
import {
  FilterCondition,
  FilterDataType,
  FilterOperator,
  OperatorOptionMap,
} from 'models/interfaces/graphFilter';
import { Neo4jNode } from 'models/interfaces/ontology';
import { Neo4jService } from 'services/neo4j';
import { getOperatorsForType, getPropertyType } from 'utils/ontology';

const { RangePicker } = DatePicker;

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

interface FilterPopupProps {
  nodes: Neo4jNode[];
  onApplyFilters: (filters: FilterCondition[]) => void;
}

export const FilterPopup: FC<FilterPopupProps> = ({
  nodes,
  onApplyFilters,
}) => {
  const labelFilters = useSelector(selectLabelFilters);
  const propertyFilters = useSelector(selectPropertyFilters);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [propertyValueOptions, setPropertyValueOptions] = useState<
    Record<string, any[]>
  >({});

  useEffect(() => {
    setFilters(propertyFilters);
  }, [propertyFilters]);

  // Fetch unique property values when label/property are selected
  useEffect(() => {
    const fetchPropertyValues = async () => {
      for (const filter of filters) {
        if (filter.nodeLabel && filter.property) {
          const key = `${filter.nodeLabel}:${filter.property}`;

          // Skip if already fetched
          // or data type is number/date (too many unique values)
          const type = getPropertyType(
            nodes,
            filter.nodeLabel,
            filter.property,
          );
          if (
            propertyValueOptions[key] !== undefined ||
            type === FilterDataType.NUMBER ||
            type === FilterDataType.DATE
          ) {
            continue;
          }

          try {
            const values = await Neo4jService.fetchPropertyValues(
              filter.nodeLabel,
              filter.property,
              50,
            );

            setPropertyValueOptions((prev) => ({
              ...prev,
              [key]: values,
            }));
          } catch (error) {
            console.error('Error fetching property values:', error);
            setPropertyValueOptions((prev) => ({
              ...prev,
              [key]: [],
            }));
          }
        }
      }
    };

    fetchPropertyValues();
  }, [filters]);

  // Get properties for a selected node label
  const getPropertiesForLabel = (label: string): string[] => {
    const nodeWithLabel = nodes.find((node) => node.labels.includes(label));
    const propertiesSet = new Set<string>();
    Object.keys(nodeWithLabel?.properties ?? []).forEach((prop) =>
      propertiesSet.add(prop),
    );
    return Array.from(propertiesSet).sort();
  };

  const addFilter = () => {
    setFilters([...filters, DEFAULT_FILTER]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    const updatedFilters = filters.map((f) => {
      if (f.id === id) {
        const updatedFilter = { ...f, ...updates };

        // Reset operator and value when label/property changes
        if (
          (updates.nodeLabel && updates.nodeLabel !== f.nodeLabel) ||
          (updates.property && updates.property !== f.property)
        ) {
          const propertyType = getPropertyType(
            nodes,
            updates.nodeLabel ?? '',
            updates.property ?? '',
          );
          return {
            ...updatedFilter,
            operator: '' as '',
            value: null,
            valueType: propertyType,
          };
        }

        return updatedFilter;
      }
      return f;
    });

    setFilters(updatedFilters);
  };

  const handleApply = () => {
    // Filter out incomplete filters
    const validFilters = filters.filter(
      (f) =>
        f.nodeLabel &&
        f.property &&
        f.operator &&
        f.value !== null &&
        f.value !== '',
    );
    onApplyFilters(validFilters);
  };

  const handleClear = () => {
    setFilters([]);
    onApplyFilters([]);
  };

  const getSelectableOptions = (filter: FilterCondition): any[] | null => {
    // Check if we have property value options available
    const key = `${filter.nodeLabel}:${filter.property}`;
    const options = propertyValueOptions[key];

    // If we have options and they're less than query limit, show a searchable select
    if (options && options.length > 0 && options.length < VALUE_QUERY_LIMIT)
      return options;
    return null;
  };

  const getOperatorOptions = (filter: FilterCondition) => {
    const typeOptions = getOperatorsForType(
      filter.valueType || FilterDataType.STRING,
    );

    const valueOptions = getSelectableOptions(filter);

    return typeOptions
      .filter((opt) => (valueOptions ? opt !== FilterOperator.CONTAINS : true))
      .map((opt) => ({
        label: OperatorOptionMap[opt],
        value: opt,
      }));
  };

  const renderValueInput = (filter: FilterCondition) => {
    const propertyType = filter.valueType ?? FilterDataType.STRING;

    switch (propertyType) {
      case FilterDataType.DATE:
        if (filter.operator === 'between') {
          return (
            <RangePicker
              value={
                filter.value
                  ? [dayjs(filter.value[0]), dayjs(filter.value[1])]
                  : null
              }
              onChange={(dates) => {
                if (dates) {
                  updateFilter(filter.id, {
                    value: [dates[0], dates[1]],
                  });
                } else {
                  updateFilter(filter.id, { value: null });
                }
              }}
              format="MM/DD/YYYY"
            />
          );
        }
        return (
          <DatePicker
            value={filter.value ? dayjs(filter.value) : null}
            onChange={(date) => {
              updateFilter(filter.id, { value: date?.toISOString() || null });
            }}
            format="MM/DD/YYYY"
          />
        );

      case FilterDataType.NUMBER:
        if (filter.operator === 'between') {
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

      default: {
        const options = getSelectableOptions(filter);
        if (options) {
          return (
            <Select
              showSearch
              placeholder="Select value"
              value={filter.value || undefined}
              onChange={(value) => updateFilter(filter.id, { value })}
              options={options.map((opt) => ({
                label: String(opt),
                value: opt,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          );
        }

        // Otherwise show a text input
        return (
          <Input
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
          />
        );
      }
    }
  };

  const labelPropertyOptions: Option[] = labelFilters.map((label) => ({
    value: label,
    label: label,
    children: getPropertiesForLabel(label).map((prop) => ({
      value: prop,
      label: prop,
    })),
  }));

  return (
    <div className={styles.FilterPopup}>
      <div className={styles.filterList}>
        {filters.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              No filters added. Click "Add Filter" to start filtering nodes.
            </p>
          </div>
        ) : (
          filters.map((filter) => (
            <div key={filter.id} className={styles.filterRow}>
              <Cascader
                style={{ flex: '2' }}
                placeholder="Select label and property"
                options={labelPropertyOptions}
                onChange={(value) =>
                  updateFilter(filter.id, {
                    nodeLabel: value?.[0] ?? '',
                    property: value?.[1] ?? '',
                  })
                }
              />

              <Select
                style={{ flex: '2' }}
                placeholder="Operator"
                value={filter.operator || undefined}
                onChange={(value) =>
                  updateFilter(filter.id, { operator: value })
                }
                options={getOperatorOptions(filter)}
                disabled={!filter.property}
              />

              <div style={{ flex: '3' }}>{renderValueInput(filter)}</div>

              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeFilter(filter.id)}
              />
            </div>
          ))
        )}
      </div>

      <div className={styles.actions}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addFilter} block>
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
