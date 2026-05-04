import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import type { CustomHeaderProps } from 'ag-grid-react';
import { SortDirection } from 'ag-grid-community';
import { Button, Popover } from 'antd';
import { ArrowUpIcon, ArrowDownIcon, FunnelIcon } from '@phosphor-icons/react';
import styles from './Grid.module.css';
import { selectFilters, setFilters } from 'reducers/datasource/slice';
import { DataType } from 'models/enums/dataType';
import { FilterOperator } from 'models/interfaces/filter';
import Histogram from './charts/histogram';
import DonutChart from './charts/donut';
import BarChart from './charts/bar';
import { ColumnFilterPopup } from './filter';

type HeaderProps = CustomHeaderProps & {
  distribution: Record<string, number> | null;
  dataType: DataType;
};

export default (props: HeaderProps) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const [sortSetting, setSortSetting] = useState<SortDirection>(null);
  const refButton = useRef(null);

  const numDistinct = useMemo(
    () =>
      props.distribution !== null ? Object.keys(props.distribution).length : 0,
    [props.distribution],
  );

  const numNull = useMemo(() => {
    if (props.distribution === null) {
      return 0;
    }
    return props.distribution['Null'] ?? 0;
  }, [props.distribution]);

  useEffect(() => {
    props.column.addEventListener('sortChanged', onSortChanged);
    onSortChanged();
  }, []);

  const onSortChanged = () => {
    const sort = props.column.getSort();
    setSortSetting(sort ?? null);
  };

  const onSortRequested = (order: SortDirection, event: any) => {
    props.setSort(order, event.shiftKey);
  };

  const onClickValue = (value: any) => {
    const nullFilter = value.toLowerCase() === 'null';
    const newFilter = {
      id: uuidv4(),
      column: props.column.getColId(),
      operator: nullFilter ? FilterOperator.IS_NULL : FilterOperator.EQUALS,
      value: [value],
    };
    dispatch(
      setFilters([
        ...filters.filter((f) => f.column !== props.column.getColId()),
        newFilter,
      ]),
    );
  };

  let sort = null;
  if (props.enableSorting === true) {
    const updatedSort =
      sortSetting === 'asc' ? 'desc' : sortSetting === 'desc' ? null : 'asc';
    const iconColor =
      sortSetting !== null ? 'var(--info-icon)' : 'var(--grey-dark)';
    sort = (
      <Button
        shape="circle"
        type="text"
        icon={
          sortSetting === 'asc' ? (
            <ArrowUpIcon size={16} color={iconColor} />
          ) : (
            <ArrowDownIcon size={16} color={iconColor} />
          )
        }
        onClick={(event) => onSortRequested(updatedSort, event)}
      />
    );
  }

  let chart = null;
  const colProps = props.column.getColDef();
  if (
    colProps.cellDataType !== undefined &&
    typeof colProps.cellDataType === 'string' &&
    props.distribution !== null
  ) {
    if (colProps.cellDataType === 'text') {
      chart =
        numDistinct > 8 ? (
          <BarChart
            distribution={props.distribution}
            onClickValue={onClickValue}
          />
        ) : (
          <DonutChart
            distribution={props.distribution}
            onClickValue={onClickValue}
          />
        );
    } else if (
      colProps.cellDataType === 'number' ||
      colProps.cellDataType === 'dateString'
    ) {
      chart = (
        <Histogram
          distribution={props.distribution}
          dataType={colProps.cellDataType}
          onClickValue={onClickValue}
        />
      );
    }
  }

  return (
    <div className={styles.customHeader}>
      {!props.column.isPinnedLeft() && (
        <>
          <div className={styles.top}>
            <div className={styles.colName}>{props.displayName}</div>
          </div>
          <div className={styles.chart}>{chart}</div>
          <div className={styles.bottom}>
            <div className={styles.stats}>
              <p>
                {numDistinct} distinct value{numDistinct !== 1 ? 's' : ''}
              </p>
              {numNull > 0 && <p>{numNull} empty</p>}
            </div>
            <div className={styles.btnWrapper}>
              <Popover
                content={
                  <ColumnFilterPopup
                    columnName={props.column.getColId()}
                    dataType={props.dataType}
                    filter={filters.find(
                      (f) => f.column === props.column.getColId(),
                    )}
                  />
                }
                title={props.column.getColId()}
                trigger="click"
              >
                <Button
                  ref={refButton}
                  shape="circle"
                  type="text"
                  icon={
                    <FunnelIcon
                      color={
                        filters.find(
                          (f) => f.column === props.column.getColId(),
                        )
                          ? 'var(--info-icon)'
                          : 'var(--grey-dark)'
                      }
                    />
                  }
                />
              </Popover>
              {sort}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
