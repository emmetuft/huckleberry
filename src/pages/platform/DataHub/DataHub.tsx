import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table } from 'antd';
import styles from './DataHub.module.css';
import { useAppDispatch } from 'reducers';
import { selectIdentity } from 'reducers/app/slice';
import { fetchDataSourceList } from 'reducers/datasource/actions';
import {
  selectDataSourceList,
  selectDataSourceLoading,
  selectTotalSources,
} from 'reducers/datasource/slice';
import { dataSourceColumns } from 'constants/data';
// import { DataProvidersChart } from './charts/DataProviders';
// import { RecentRunsChart } from './charts/RecentRuns';
// import { DataSourceUsageTrendChart } from './charts/DataSourceUsageTrendChart';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { DataControls } from './DataControls/DataControls';
import { renderVal } from 'utils/data';
import { useIsMobile } from 'hooks/useIsMobile';

interface DataHubProps {}

export const DataHub: FC<DataHubProps> = ({}) => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);
  const navigate = useNavigate();

  const dataSourceList = useSelector(selectDataSourceList);
  const totalRows = useSelector(selectTotalSources);
  const loading = useSelector(selectDataSourceLoading).dataSourceList;

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20);

  const topSectionRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number>(500);
  const isMobile = useIsMobile();

  useEffect(() => {
    const resize = () => {
      const topHeight = topSectionRef.current?.offsetHeight || 0;
      const topMargin = isMobile ? 10 : 12;
      const padding = isMobile ? 50 * 2 : 80;
      const extraTableHeight = isMobile ? 39 + 57 : 61 + 65 + 2; // header + pagination + borders
      setTableHeight(
        window.innerHeight - topHeight - topMargin - padding - extraTableHeight,
      );
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!loading) fetchDataSources();
  }, [page, size]);

  const fetchDataSources = async () => {
    dispatch(fetchDataSourceList({ page, size }));
  };

  const commonColConfig = {
    minWidth: 100,
    maxWidth: 200,
  };

  const columns = useMemo(
    () =>
      dataSourceColumns.map((col) => ({
        ...commonColConfig,
        ...col,
        title: col.name,
        key: col.id,
        render: (val: any) => cellRenderer(col, val),
      })),
    [identity],
  );

  const cellRenderer = (col: any, val: any) => {
    if (col.id === 'owner') {
      return <Avatar userId={val.id} name={val.name} showName height={25} />;
    }

    if (col.id === 'tags' && typeof val === 'string') {
      const tagList = JSON.parse(val);
      return (
        <div className={styles.tags}>
          {tagList.map((tag: string, index: number) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      );
    }

    return renderVal(col, val);
  };

  const onChangePagination = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  return (
    <div className="platformPage">
      <div ref={topSectionRef} className={styles.topSection}>
        {/* <div className={styles.chartContainer}>
          <p className={styles.chartTitle}>Top 5 Data Providers</p>
          <DataProvidersChart height={260} />
          </div>
          <div className={styles.chartContainer}>
          <p className={styles.chartTitle}>Current Week DataSource Runs</p>
          <RecentRunsChart height={260} />
          </div>
          <div className={styles.chartContainer}>
          <p className={styles.chartTitle}>Current Week Avg Run Time</p>
          <DataSourceUsageTrendChart height={260} />
          </div> */}
        <DataControls />
      </div>
      <Table
        dataSource={dataSourceList}
        columns={columns}
        loading={loading}
        pagination={{
          current: page,
          pageSize: size,
          pageSizeOptions: ['20', '50', '100'],
          showSizeChanger: true,
          total: totalRows,
          onChange: onChangePagination,
        }}
        scroll={{
          scrollToFirstRowOnChange: true,
          x: 'max-content',
          y: tableHeight,
        }}
        tableLayout="auto"
        className={`card ${styles.dataTable}`}
        onRow={(record) => ({
          onClick: () => navigate(`/data-hub/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
};
