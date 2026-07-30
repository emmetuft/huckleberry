import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table } from 'antd';
import { PlusIcon } from '@phosphor-icons/react';
import styles from './MetricCatalog.module.css';
import { useAppDispatch } from 'reducers';
import { fetchMetrics } from 'reducers/metrics/actions';
import { selectMetrics, selectMetricsLoading } from 'reducers/metrics/slice';
import { Metric } from 'models/interfaces/metric';
import { SaveMetricModal } from 'components/modals/SaveMetricModal/SaveMetricModal';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Datasource', dataIndex: 'dataSourceName', key: 'dataSourceName' },
  { title: 'Owner', dataIndex: 'ownerDisplayName', key: 'ownerDisplayName' },
  {
    title: 'Grain',
    dataIndex: 'preferredDateGrain',
    key: 'preferredDateGrain',
  },
  {
    title: 'Aggregation',
    key: 'aggregation',
    render: (_: unknown, m: Metric) =>
      m.aggregation ? `${m.aggregation.function}(${m.aggregation.value})` : '—',
  },
  {
    title: 'Modified',
    dataIndex: 'modified',
    key: 'modified',
    render: (val?: number) => (val ? new Date(val).toLocaleDateString() : '—'),
  },
];

export const MetricCatalog: FC = () => {
  const dispatch = useAppDispatch();
  const metrics = useSelector(selectMetrics);
  const loading = useSelector(selectMetricsLoading);
  const [modalState, setModalState] = useState<{
    open: boolean;
    metric?: Metric;
  }>({ open: false });

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(0);

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
      const paginationMargin = pagination ? 16 : 0;
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
    dispatch(fetchMetrics());
  }, [dispatch]);

  return (
    <div className="platformPage">
      <div className={styles.header}>
        <Button
          type="primary"
          icon={<PlusIcon />}
          onClick={() => setModalState({ open: true })}
        >
          New Metric
        </Button>
      </div>
      <div ref={tableWrapperRef} className={styles.tableWrapper}>
        <Table
          rowKey="id"
          dataSource={metrics}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 20,
            pageSizeOptions: ['20', '50', '100'],
            showSizeChanger: true,
          }}
          scroll={{
            scrollToFirstRowOnChange: true,
            x: 'max-content',
            y: tableHeight,
          }}
          tableLayout="auto"
          className={styles.dataTable}
          onRow={(record) => ({
            onClick: () => setModalState({ open: true, metric: record }),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
      <SaveMetricModal
        isOpen={modalState.open}
        metric={modalState.metric}
        onClose={() => setModalState({ open: false })}
        onSaved={() => dispatch(fetchMetrics())}
      />
    </div>
  );
};
