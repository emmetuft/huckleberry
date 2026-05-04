import { FC, useEffect, useRef, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'reducers';
import {
  selectDataSource,
  selectDataSourceSchema,
  selectDataLoadedList,
  addDataLoaded,
} from 'reducers/datasource/slice';
import pLimit from 'p-limit';
import { DuckDBContext } from './DuckDBProvider';
import { DataService } from 'services/data';
import { mapDataTypeToSQL } from 'utils/duckdb';
import { Column } from 'models/interfaces/column';

function buildCSV(
  rows: Record<string, unknown>[],
  schema: Column[],
): Uint8Array {
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = schema
    .map((col) => `"${col.name.replace(/"/g, '""')}"`)
    .join(',');
  const dataRows = rows.map((row) =>
    schema.map((col) => escape(row[col.name])).join(','),
  );

  return new TextEncoder().encode([header, ...dataRows].join('\n'));
}

const Database: FC = () => {
  const dispatch = useAppDispatch();
  const datasource = useSelector(selectDataSource);
  const schema = useSelector(selectDataSourceSchema);

  const { database, dbConn } = useContext(DuckDBContext);
  const dataLoadedList = useSelector(selectDataLoadedList);
  const loadingRef = useRef<boolean>(false);

  useEffect(() => {
    async function loadData() {
      if (
        database === null ||
        dbConn === null ||
        datasource === null ||
        schema.length === 0
      )
        return;
      if (loadingRef.current === true) return;
      if (dataLoadedList.includes(datasource.id)) return;
      await insertBatches(datasource.id, datasource.rowCount);
    }

    loadData();
  }, [database, dbConn, schema, dataLoadedList]);

  async function insertBatches(sourceId: string, rowCount: number) {
    if (database === null || datasource === null || dbConn === null) return;
    loadingRef.current = true;

    const PAGE_SIZE = 10000;
    const CONCURRENCY = 5;
    const MAX_BATCHES = 100;
    const fileName = `${sourceId}.csv`;

    try {
      const sqlSchema = schema
        .map((col) => `"${col.name}" ${mapDataTypeToSQL(col.type)}`)
        .join(', ');
      await dbConn.query(
        `CREATE OR REPLACE TABLE "${sourceId}" (${sqlSchema})`,
      );

      const totalBatches = Math.min(
        Math.ceil(rowCount / PAGE_SIZE),
        MAX_BATCHES,
      );

      // TODO: Fetch dataset as CSV file instead of fetching each page at a time and converting to CSV in memory
      const limit = pLimit(CONCURRENCY);
      const batches = await Promise.all(
        Array.from({ length: totalBatches }, (_, i) =>
          limit(() =>
            DataService.fetchDataSourceRows({
              dataSourceId: datasource.id,
              schema,
              page: i + 1,
              pageSize: PAGE_SIZE,
            }),
          ),
        ),
      );

      const allRows = batches.flat();
      if (allRows.length > 0) {
        const csvBuffer = buildCSV(allRows, schema);
        await database.registerFileBuffer(fileName, csvBuffer);
        await dbConn.insertCSVFromPath(fileName, {
          name: sourceId,
          schema: 'main',
          create: false,
          header: true,
        });
        await database.dropFile(fileName);
      }

      dispatch(addDataLoaded(datasource.id));
    } catch (error) {
      console.log('Duck DB Database error:', error);
    } finally {
      loadingRef.current = false;
    }
  }

  return null;
};

export default Database;
