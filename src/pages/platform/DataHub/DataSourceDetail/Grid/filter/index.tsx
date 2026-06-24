import { FC, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Button, DatePicker, Input, InputNumber, Select } from 'antd';
import styles from './index.module.css';
import { selectFilters, setFilters } from 'reducers/datasource/slice';
import {
  Filter,
  FilterOperator,
  operatorLabelMap,
} from 'models/interfaces/filter';
import { DataType, isDateType, isNumericType } from 'models/enums/dataType';
import { OptionList } from './optionList';
import { isEmpty } from 'utils/misc';

interface Props {
  columnName: string;
  dataType: DataType;
  filter?: Filter;
}

export const ColumnFilterPopup: FC<Props> = ({
  columnName,
  dataType,
  filter,
}) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const [operator, setOperator] = useState<FilterOperator>(
    filter?.operator ?? FilterOperator.EQUALS,
  );
  const [filterValue, setFilterValue] = useState<string>('');
  const [betweenValues, setBetweenValues] = useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' });
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    // Update state variables to display existing filter
    if (filter !== undefined) {
      switch (filter.operator) {
        case FilterOperator.BETWEEN:
          setBetweenValues({
            from: filter.value[0],
            to: filter.value[1],
          });
          break;
        case FilterOperator.IN:
        case FilterOperator.NOT_IN:
          break;
        default:
          setFilterValue(filter.value[0]);
      }
    }
  }, [filter]);

  const onChangeOperator = (value: FilterOperator) => {
    setOperator(value);
  };

  const onChangeBetweenValue = (value: any, type: string) => {
    setBetweenValues({
      ...betweenValues,
      [type]: value?.toString() ?? '',
    });
  };

  const resetColumnFilter = () => {
    setFilterValue('');
    setBetweenValues({ from: '', to: '' });

    const newFilterState = [...filters];
    const existingFilterIndex = newFilterState.findIndex(
      (f) => f.column === columnName,
    );
    if (existingFilterIndex !== -1) {
      newFilterState.splice(existingFilterIndex, 1);
      dispatch(setFilters(newFilterState));
    }
  };

  const applyColumFilter = () => {
    if (operator !== undefined) {
      const value = getFilterValue();
      const newFilter = {
        id: uuidv4(),
        column: columnName,
        operator,
        value,
      };

      // Update columnFilters state to include new filter
      const newFilterState = [...filters];
      const existingFilterIndex = newFilterState.findIndex(
        (f) => f.column === newFilter.column,
      );
      if (existingFilterIndex !== -1) {
        newFilterState[existingFilterIndex] = newFilter;
      } else {
        newFilterState.push(newFilter);
      }

      dispatch(setFilters(newFilterState));
    }
  };

  const getFilterValue = () => {
    switch (operator) {
      case FilterOperator.IN:
      case FilterOperator.NOT_IN:
        return Array.from(selectedOptions);
      case FilterOperator.BETWEEN:
        return [betweenValues.from, betweenValues.to];
      default:
        return [filterValue];
    }
  };

  const operatorOptions = useMemo(() => {
    let options = [
      // FilterOperator.IN,
      // FilterOperator.NOT_IN,
      FilterOperator.EQUALS,
      FilterOperator.NOT_EQUALS,
    ];
    switch (dataType) {
      case DataType.DECIMAL:
      case DataType.DOUBLE:
      case DataType.LONG:
      case DataType.DATE:
      case DataType.DATETIME:
        options = [
          ...options,
          FilterOperator.GREATER_THAN,
          FilterOperator.LESS_THAN,
          FilterOperator.GREATER_THAN_OR_EQUALS,
          FilterOperator.LESS_THAN_OR_EQUALS,
          FilterOperator.BETWEEN,
        ];
        break;
      case DataType.STRING:
        options = [...options, FilterOperator.LIKE, FilterOperator.NOT_LIKE];
        break;
      default:
        options = [...options];
        break;
    }
    return options.map((x) => ({
      value: x,
      label: operatorLabelMap[x] ?? x,
    }));
  }, [dataType]);

  const renderInput = () => {
    switch (operator) {
      case undefined:
        return null;
      case FilterOperator.BETWEEN:
        return isNumericType(dataType) ? (
          <div className={styles.betweenInput}>
            <InputNumber
              value={betweenValues.from}
              onChange={(val) => onChangeBetweenValue(val, 'from')}
            />
            <InputNumber
              value={betweenValues.to}
              onChange={(val) => onChangeBetweenValue(val, 'to')}
            />
          </div>
        ) : isDateType(dataType) ? (
          <div className={styles.betweenInput}>
            <DatePicker
              value={
                isEmpty(betweenValues.from) ? '' : dayjs(betweenValues.from)
              }
              onChange={(_date, dateString) =>
                onChangeBetweenValue(dateString, 'from')
              }
            />
            <DatePicker
              value={isEmpty(betweenValues.to) ? '' : dayjs(betweenValues.to)}
              onChange={(_date, dateString) =>
                onChangeBetweenValue(dateString, 'to')
              }
            />
          </div>
        ) : null;
      case FilterOperator.IN:
      case FilterOperator.NOT_IN:
        return (
          <OptionList
            columnName={columnName}
            dataType={dataType}
            operator={operator}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
        );
      default:
        return isDateType(dataType) ? (
          <DatePicker
            value={isEmpty(filterValue) ? '' : dayjs(filterValue)}
            onChange={(_date, dateString) =>
              setFilterValue(typeof dateString === 'string' ? dateString : '')
            }
          />
        ) : isNumericType(dataType) ? (
          <InputNumber
            value={filterValue}
            onChange={(val) => setFilterValue(val?.toString() ?? '')}
          />
        ) : (
          <Input
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        );
    }
  };

  return (
    <div
      className={styles.columnFilterPopup}
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        style={{ width: '100%' }}
        value={operator}
        onChange={onChangeOperator}
        options={operatorOptions}
      />
      {renderInput()}
      <div className={styles.buttons}>
        <Button onClick={resetColumnFilter} disabled={filter === undefined}>
          Reset
        </Button>
        <Button onClick={applyColumFilter}>Apply</Button>
      </div>
    </div>
  );
};
