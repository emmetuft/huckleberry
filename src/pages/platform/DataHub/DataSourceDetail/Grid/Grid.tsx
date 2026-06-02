import { FC, useMemo, useState } from 'react';
import { ArrowsInIcon, ArrowsOutIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';
import { Button } from 'antd';
import styles from './Grid.module.css';
import {
  selectColumnDistributions,
  selectDataSource,
  selectDataSourceLoading,
  selectDataSourceSchema,
  selectPage,
  selectPageData,
} from 'reducers/datasource/slice';
import { DEFAULT_PAGE_SIZE } from 'constants/data';
import {
  cellDataTypeMap,
  DataType,
  isNumericType,
} from 'models/enums/dataType';
import GridHeader from './GridHeader';
import Pagination from './pagination';
import { formatNumber } from 'utils/data';

dayjs.extend(relativeTime);

const myTheme = themeQuartz.withParams({
  borderColor: 'none',
  backgroundColor: 'var(--background)',
  foregroundColor: 'var(--text)',
  headerBackgroundColor: 'var(--background)',
  headerTextColor: 'var(--text)',
  headerColumnBorder: '1px solid var(--grey-light)',
  headerRowBorder: '1px solid var(--grey-light)',
  headerColumnResizeHandleWidth: '0px',
  columnBorder: '1px solid var(--grey-light)',
  rowBorder: 'none',
  rowHoverColor: 'var(--grey-bg)',
  rowVerticalPaddingScale: 0.5,
});

const Grid: FC = () => {
  const dataSource = useSelector(selectDataSource);
  const schema = useSelector(selectDataSourceSchema);
  const data = useSelector(selectPageData);
  const columnDistributions = useSelector(selectColumnDistributions);
  const page = useSelector(selectPage);
  const loading = useSelector(selectDataSourceLoading);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const theme = useMemo<Theme | 'legacy'>(() => myTheme, []);

  const colDefs = useMemo<ColDef[]>(
    () => [
      {
        valueGetter: (params: any) => {
          if (loading.dataSource) return '';
          return (page - 1) * DEFAULT_PAGE_SIZE + params.node.rowIndex + 1;
        },
        width: 70,
        pinned: 'left',
        suppressMovable: true,
        sortable: false,
        cellStyle: {
          textAlign: 'right',
          color: 'var(--grey-text)',
          borderRight: '1px solid var(--grey-light)',
        },
      },
      ...schema.map((column) => ({
        field: column.name,
        autoHeaderHeight: true,
        width: 150,
        minWidth: 100,
        valueFormatter: (params: any) => formatValue(params.value, column.type),
        cellDataType:
          cellDataTypeMap[column.type as keyof typeof cellDataTypeMap],
        headerComponent: GridHeader,
        headerComponentParams: {
          distribution: columnDistributions[column.name] ?? null,
          dataType: column.type,
        },
        cellStyle: isNumericType(column.type)
          ? { textAlign: 'right' }
          : undefined,
      })),
    ],
    [schema, columnDistributions, page, data.length, loading],
  );

  const formatValue = (value: any, dataType: DataType) => {
    switch (dataType) {
      case DataType.LONG:
      case DataType.DECIMAL:
      case DataType.DOUBLE:
        return formatNumber(value);
      default:
        return value;
    }
  };

  if (dataSource === null) return null;

  return (
    <div
      className={`${styles.gridWrapper} ${isFullscreen ? styles.fullscreen : ''}`}
    >
      <Button
        className={styles.expandBtn}
        icon={
          isFullscreen ? (
            <ArrowsInIcon size={18} />
          ) : (
            <ArrowsOutIcon size={18} />
          )
        }
        onClick={() => setIsFullscreen((v) => !v)}
      />
      <div style={{ flex: 1 }}>
        <AgGridReact
          rowData={data}
          columnDefs={colDefs}
          theme={theme}
          loading={loading.dataSource}
          gridOptions={{
            headerHeight: 350,
          }}
        />
      </div>

      <div className={styles.gridFooter}>
        <div className={styles.footerLeft}>
          {/* <div className={styles.lastUpdated}>
            <Icon icon={IconType.CLOCK} size={20} />
            <span>Updated {dayjs(selectedSource.lastRunDate).fromNow()}</span>
          </div> */}
          <div className={styles.dataSummary}>
            <p>{dataSource.rowCount} rows</p>
            <p>{schema.length} columns</p>
          </div>
        </div>
        <Pagination pageSize={DEFAULT_PAGE_SIZE} />
        <div className={styles.status}>
          <div className={styles.statusPill}>Healthy</div>
        </div>
      </div>
    </div>
  );
};

export default Grid;
