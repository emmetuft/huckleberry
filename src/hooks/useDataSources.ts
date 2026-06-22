import { useState, useEffect, useRef, useCallback } from 'react';
import { DataSource } from 'models/interfaces/dataSource';
import { DataService } from 'services/data';

interface UseDataSourcesOptions {
  pageSize?: number;
  debounceMs?: number;
  loadOnMount?: boolean;
}

interface UseDataSourcesReturn {
  dataSources: DataSource[];
  loading: boolean;
  hasMore: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loadNextPage: () => void;
  reset: (initialSearch?: string) => void;
}

export function useDataSources({
  pageSize = 20,
  debounceMs = 500,
  loadOnMount = true,
}: UseDataSourcesOptions = {}): UseDataSourcesReturn {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTermState] = useState('');

  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const searchTermRef = useRef('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number, search: string, append: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const result = await DataService.getDataSources({
          page: pageNum,
          size: pageSize,
          searchTerm: search,
        });
        if (append) {
          setDataSources((prev) => [...prev, ...result.sources]);
        } else {
          setDataSources(result.sources);
        }
        setHasMore(
          result.sources.length === pageSize &&
            result.total > pageNum * pageSize,
        );
      } catch (error) {
        console.error('Failed to fetch data sources:', error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [pageSize],
  );

  // Initial load
  useEffect(() => {
    if (loadOnMount) {
      fetchPage(1, '', false);
    }
  }, []);

  const setSearchTerm = useCallback(
    (term: string) => {
      searchTermRef.current = term;
      setSearchTermState(term);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      pageRef.current = 1;
      debounceTimerRef.current = setTimeout(() => {
        fetchPage(1, term, false);
      }, debounceMs);
    },
    [fetchPage, debounceMs],
  );

  const loadNextPage = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchPage(nextPage, searchTermRef.current, true);
  }, [hasMore, fetchPage]);

  const reset = useCallback(
    (initialSearch: string = '') => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      pageRef.current = 1;
      searchTermRef.current = initialSearch;
      setDataSources([]);
      setHasMore(true);
      setSearchTermState(initialSearch);
      fetchPage(1, initialSearch, false);
    },
    [fetchPage],
  );

  return {
    dataSources,
    loading,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadNextPage,
    reset,
  };
}
