import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'antd';
import styles from './DataHub.module.scss';
import { DataService } from 'services/data';
import { dataSourceColumns } from 'constants/data';
import { renderVal } from 'utils/data';
import { useSelector } from 'react-redux';
import { selectIdentity } from 'reducers/app/slice';
import { DataProvidersChart } from './charts/DataProviders';
import { RecentRunsChart } from './charts/RecentRuns';
import { DataSourceUsageTrendChart } from './charts/DataSourceUsageTrendChart';

interface DataHubProps {}

export const DataHub: FC<DataHubProps> = ({}) => {
  const identity = useSelector(selectIdentity);

  const [dataSourceList, setDataSourceList] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);

  const topSectionRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number>(500);

  useEffect(() => {
    const resize = () => {
      const topHeight = topSectionRef.current?.offsetHeight || 0;
      const padding = 100;
      const extraTableHeight = 61 + 64;
      setTableHeight(
        window.innerHeight - topHeight - padding - extraTableHeight,
      );
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!loadingRef.current) fetchDataSources();
  }, [page, size]);

  const fetchDataSources = async () => {
    loadingRef.current = true;
    setLoading(true);
    const res = await DataService.fetchDataSources({
      page,
      size,
      searchTerm: '',
    });
    setDataSourceList(res.sources);
    setTotalRows(res.total);
    loadingRef.current = false;
    setLoading(false);
  };

  const commonColConfig = {
    minWidth: 100,
    maxWidth: 200,
    width: loadingRef.current ? 100 : undefined,
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
      const avatar =
        identity !== undefined
          ? `https://${identity.host}/api/content/v1/avatar/USER/${val.id}?size=100`
          : undefined;

      return (
        <div className={styles.owner}>
          <img className={styles.avatar} src={avatar} alt={val.name} />
          <span>{val.name}</span>
        </div>
      );
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
    <div className={styles.DataHub}>
      <div ref={topSectionRef} className={styles.topSection}>
        <div className={styles.chartContainer}>
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
        </div>
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
        className={styles.dataTable}
      />
    </div>
  );
};
