import { FC, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from './DataTab.module.css';
import { useAppDispatch } from 'reducers';
import {
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
import { DuckDBContext } from 'components/duckdb/DuckDBProvider';
import { DataFilters } from './DataFilters/DataFilters';
import { DetailItems } from './DetailItems/DetailItems';
import Grid from './Grid/Grid';
import { getWhereClause } from 'utils/duckdb';

export const DataTab: FC = () => {
  const dispatch = useAppDispatch();

  const schema = useSelector(selectDataSourceSchema);
  const dataSource = useSelector(selectDataSource);
  const filters = useSelector(selectFilters);
  const page = useSelector(selectPage);
  const dataLoadedList = useSelector(selectDataLoadedList);

  const { dbConn } = useContext(DuckDBContext);
  const loadingRef = useRef<boolean>(false);

  const shouldLoadData =
    dataSource !== null && dataLoadedList.includes(dataSource.id);

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
      console.error('Error fetching data:', error);
    } finally {
      loadingRef.current = false;
    }
  }

  const BATCH_SIZE = 50;

  async function fetchColumnDistributions() {
    if (dbConn === null || dataSource === null) return;

    const stringColumns = schema.map((c) => c.name);
    if (stringColumns.length === 0) return;

    const columnDistributions: Record<string, Record<string, number>> = {};

    const batches = [];
    for (let i = 0; i < stringColumns.length; i += BATCH_SIZE) {
      batches.push(stringColumns.slice(i, i + BATCH_SIZE));
    }

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

  return (
    <div className={styles.dataTab}>
      <DetailItems />
      <DataFilters />
      <Grid />
    </div>
  );
};
