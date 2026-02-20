import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table } from 'antd';
import styles from './MetricCatalog.module.scss';
import { selectMetricCatalogSchema } from 'reducers/metrics/slice';
import { departmentColors, metricCatalogDatasourceId } from 'constants/metrics';
import { DataService } from 'services/data';
import { renderVal } from 'utils/data';

export const MetricCatalog: FC = () => {
  const metricCatalogSchema = useSelector(selectMetricCatalogSchema);

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!loadingRef.current && metricCatalogSchema.length > 0) fetchData();
  }, [page, size, metricCatalogSchema]);

  const fetchData = async () => {
    loadingRef.current = true;
    setLoading(true);
    const res = await DataService.fetchDataSourceRows({
      dataSourceId: metricCatalogDatasourceId,
      schema: metricCatalogSchema,
      page,
      pageSize: size,
    });
    setData(res);
    //   setTotalRows(res.total);
    loadingRef.current = false;
    setLoading(false);
  };

  const onChangePagination = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  const commonColConfig = {
    minWidth: 100,
    maxWidth: 200,
    width: loadingRef.current ? 100 : undefined,
  };

  const columns = useMemo(
    () =>
      metricCatalogSchema.map((col) => ({
        ...commonColConfig,
        ...col,
        title: col.name,
        key: col.id,
        dataIndex: col.name,
        render: (val: any) => cellRenderer(col, val),
      })),
    [metricCatalogSchema],
  );

  const cellRenderer = (col: any, val: any) => {
    if (col.id === 'department') {
      return (
        <div className={styles.tag} style={departmentColors[val]}>
          {val}
        </div>
      );
    }

    return renderVal(col, val);
  };

  return (
    <div className={styles.MetricCatalog}>
      <Table
        dataSource={data}
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
          //   y: tableHeight,
        }}
        tableLayout="auto"
        className={styles.dataTable}
      />
    </div>
  );
};
