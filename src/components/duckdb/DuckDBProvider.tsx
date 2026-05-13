import { createContext, FC, useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

export const DuckDBContext = createContext<{
  database: duckdb.AsyncDuckDB | null;
  dbConn: duckdb.AsyncDuckDBConnection | null;
}>({
  database: null,
  dbConn: null,
});

export const DuckDBProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [database, setDatabase] = useState<duckdb.AsyncDuckDB | null>(null);
  const [dbConn, setDbConn] = useState<duckdb.AsyncDuckDBConnection | null>(
    null,
  );

  useEffect(() => {
    initDuckDB();
    return () => {
      closeDuckDB();
    };
  }, []);

  async function initDuckDB() {
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
    if (bundle.mainWorker === null) {
      throw new Error('No mainWorker found');
    }

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: 'text/javascript',
      }),
    );

    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);

    const connection = await db.connect();
    setDbConn(connection);
    setDatabase(db);
  }

  async function closeDuckDB() {
    if (dbConn !== null) await dbConn.close();
  }

  return (
    <DuckDBContext.Provider value={{ database, dbConn }}>
      {children}
    </DuckDBContext.Provider>
  );
};
