import { useEffect, useRef, useState } from 'react';
import { Filter } from 'models/interfaces/filter';
import { DataService } from 'services/data';
import { DEFAULT_PAGE_SIZE } from 'constants/data';
import { Column } from 'models/interfaces/column';

type UseChartDataOptions<_T> = {
  dataSourceId: string;
  schema: Column[];
  filters?: Filter[];
  customSelect?: string;
  groupBy?: string[];
  orderBy?: string[];
  limit?: number;
};

export function useChartData<T>({
  dataSourceId,
  schema,
  filters: _filters,
  customSelect: _customSelect,
  groupBy: _groupBy,
  orderBy: _orderBy,
  limit,
}: UseChartDataOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!loadingRef.current) fetchData();
  }, []);

  const fetchData = async () => {
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await DataService.getDataSourceRows({
        dataSourceId,
        schema,
        page: 1,
        pageSize: limit ?? DEFAULT_PAGE_SIZE,
      });
      setData(res as T[]);
    } catch (error) {
      console.error(`Error fetching data for ${dataSourceId}:`, error);
      setError(error as Error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return { data, loading, error };
}
