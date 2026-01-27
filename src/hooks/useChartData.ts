import { useEffect, useRef, useState } from 'react';
import { Filter } from 'models/interfaces/filter';
import { ChartService } from 'services/chart';

type UseChartDataOptions<T> = {
  alias: string;
  schema: string[];
  filters?: Filter[];
  customSelect?: string;
  groupBy?: string[];
  orderBy?: string[];
  limit?: number;
};

export function useChartData<T>({
  alias,
  schema,
  filters,
  customSelect,
  groupBy,
  orderBy,
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
      const res = await ChartService.fetchDataSource({
        schema,
        alias,
        customSelect,
        filters,
        groupBy,
        orderBy,
        limit,
      });
      setData(res as T[]);
    } catch (error) {
      console.error(`Error fetching data for ${alias}:`, error);
      setError(error as Error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return { data, loading, error };
}
