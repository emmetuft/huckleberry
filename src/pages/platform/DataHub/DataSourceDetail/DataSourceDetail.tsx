import { FC, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Tag } from 'antd';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import styles from './DataSourceDetail.module.css';
import { useAppDispatch } from 'reducers';
import { fetchDataSource } from 'reducers/datasource/actions';
import {
  clearDataSource,
  selectDataLoadedList,
  selectDataSource,
  selectDataSourceSchema,
  selectFilters,
  selectPage,
  setColumnDistributions,
  setNumRows,
  setPageData,
} from 'reducers/datasource/slice';
import { DEFAULT_PAGE_SIZE } from 'constants/data';
import { AppPage, platformRoutePaths } from 'models/enums/appPage';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { DuckDBContext } from 'components/duckdb/DuckDBProvider';
import { DataFilters } from './DataFilters/DataFilters';
import { DetailItems } from './DetailItems/DetailItems';
import Grid from './Grid/Grid';
import { getWhereClause } from 'utils/duckdb';

export const DataSourceDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schema = useSelector(selectDataSourceSchema);
  const dataSource = useSelector(selectDataSource);
  const filters = useSelector(selectFilters);
  const page = useSelector(selectPage);
  const dataLoadedList = useSelector(selectDataLoadedList);

  const [tableHeight, setTableHeight] = useState<number>(500);
  const topSectionRef = useRef<HTMLDivElement>(null);

  const { dbConn } = useContext(DuckDBContext);
  const fetchedIdRef = useRef<string | null>(null);
  const loadingRef = useRef<boolean>(false);

  const shouldLoadData =
    dataSource !== null &&
    dataSource.id === id &&
    dataLoadedList.includes(dataSource.id);

  useEffect(() => {
    if (!id || fetchedIdRef.current === id) return;
    fetchedIdRef.current = id;
    dispatch(fetchDataSource(id));
    return () => {
      dispatch(clearDataSource());
    };
  }, [id]);

  useEffect(() => {
    if (shouldLoadData) {
      fetchNumRows();
      fetchData();
      fetchColumnDistributions();
    }
  }, [dataLoadedList, dataSource]);

  useEffect(() => {
    if (shouldLoadData) {
      fetchNumRows();
      fetchData();
    }
  }, [filters]);

  useEffect(() => {
    if (shouldLoadData) {
      fetchData();
    }
  }, [page]);

  useEffect(() => {
    const resize = () => {
      const topHeight = topSectionRef.current?.offsetHeight || 0;
      const padding = 40;
      setTableHeight(window.innerHeight - topHeight - padding);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  async function fetchNumRows() {
    if (dbConn === null || dataSource === null) return;
    try {
      const whereCondition =
        filters.length > 0 ? `WHERE ${getWhereClause(filters)}` : '';
      const result = await dbConn.query(`
        SELECT COUNT(*) AS count
        FROM "${dataSource.id}"
        ${whereCondition};
      `);
      const rows = result.toArray().map((row) => row.toJSON());
      const count = rows.length > 0 ? Number(rows[0].count) : 0;
      dispatch(setNumRows(count));
    } catch (error) {
      console.error('Error fetching number of rows:', error);
    }
  }

  async function fetchData() {
    if (dbConn === null || dataSource === null) return;
    try {
      loadingRef.current = true;
      const whereCondition =
        filters.length > 0 ? `WHERE ${getWhereClause(filters)}` : '';
      const query = `
      SELECT *
      FROM "${dataSource.id}"
      ${whereCondition}
      LIMIT ${DEFAULT_PAGE_SIZE}
      OFFSET ${DEFAULT_PAGE_SIZE * (page - 1)};`;
      const result = await dbConn.query(query);
      const plainData = result.toArray().map((r: any) => ({ ...r }));
      dispatch(setPageData(plainData));
    } catch (error) {
      console.error('Error fetching number of rows:', error);
    } finally {
      loadingRef.current = false;
    }
  }

  const BATCH_SIZE = 50; // Number of columns per query batch

  async function fetchColumnDistributions() {
    if (dbConn === null || dataSource === null) return;

    const stringColumns = schema.map((c) => c.name);

    if (stringColumns.length === 0) return;

    const columnDistributions: Record<string, Record<string, number>> = {};

    // Split the columns into batches
    const batches = [];
    for (let i = 0; i < stringColumns.length; i += BATCH_SIZE) {
      batches.push(stringColumns.slice(i, i + BATCH_SIZE));
    }

    // Execute queries in batches
    for (const batch of batches) {
      const unionQueries = batch
        .map(
          (column) => `
      SELECT 
        '${column}' AS columnName,
        value,
        COUNT(*) AS count
      FROM (
        SELECT 
          CASE 
            WHEN "${column}" IS NULL OR CAST("${column}" AS STRING) = '' THEN NULL 
            ELSE "${column}"
          END AS value
        FROM "${dataSource.id}"
      )
      GROUP BY value
    `,
        )
        .join(' UNION ALL ');

      const query = `
        ${unionQueries}
        ORDER BY columnName, count DESC
      `;

      try {
        const result = await dbConn.query(query);
        const rows = result.toArray().map((row) => row.toJSON());

        rows.forEach((row) => {
          const { columnName, value, count } = row;
          if (columnDistributions[columnName] === undefined)
            columnDistributions[columnName] = {};
          columnDistributions[columnName][value ?? 'Null'] = Number(count);
        });
      } catch (error) {
        console.error('Error fetching column distributions:', error);
      }
    }

    dispatch(setColumnDistributions(columnDistributions));
  }

  if (!dataSource) return null;

  return (
    <div className={`platformPage ${styles.datasourceDetail}`}>
      <div ref={topSectionRef} className={styles.topSection}>
        <div className={styles.header}>
          <IconBtn
            icon={<ArrowLeftIcon size={24} />}
            onClick={() => navigate(platformRoutePaths[AppPage.DATA_HUB])}
          />
          <h1 className={styles.name}>{dataSource.name}</h1>
          <Tag color={dataSource.status === 'SUCCESS' ? 'green' : 'default'}>
            {dataSource.status}
          </Tag>
        </div>
        <DetailItems />
        <DataFilters />
      </div>
      <Grid height={tableHeight} />
    </div>
  );
};
