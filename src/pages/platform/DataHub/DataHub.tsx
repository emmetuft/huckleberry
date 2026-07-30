import {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Tag } from 'antd';
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
  const [searchTerm, setSearchTerm] = useState<string>('');

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    const measure = () => {
      const header = wrapper.querySelector(
        '.ant-table-thead',
      ) as HTMLElement | null;
      const pagination = wrapper.querySelector(
        '.ant-pagination',
      ) as HTMLElement | null;
      const headerHeight = header?.offsetHeight ?? 0;
      const paginationHeight = pagination?.offsetHeight ?? 0;
      const paginationMargin = pagination ? 16 : 0; // ant-table pagination margin-block
      setTableHeight(
        wrapper.clientHeight -
          headerHeight -
          paginationHeight -
          paginationMargin,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    dispatch(
      fetchDataSourceList({
        page,
        size,
        ...(searchTerm ? { searchTerm } : {}),
      }),
    );
  }, [page, size, searchTerm]);

  const handleSearch = (term: string) => {
    setPage(1);
    setSearchTerm(term);
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
          {tagList.map((tag: string) => (
            <Tag className="defaultTag">{tag}</Tag>
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
      <DataControls onSearch={handleSearch} />
      <div ref={tableWrapperRef} className={styles.tableWrapper}>
        <Table
          dataSource={dataSourceList}
          columns={columns}
          loading={loading}
          rowKey="id"
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
          onRow={(record) => ({
            onClick: () => navigate(`/data-hub/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
    </div>
  );
};
