import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetcher: (limit: number, offset: number) => Promise<T[]>;
  resetDeps: unknown[];
  pageSize?: number;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

export const useInfiniteScroll = <T>({
  fetcher,
  resetDeps,
  pageSize = 48,
  debounceMs = 300,
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Reset and fetch first page when resetDeps change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setItems([]);
      setOffset(0);
      setHasMore(true);
      setLoading(true);
      fetcherRef.current(pageSize, 0).then((results) => {
        setItems(results);
        setHasMore(results.length === pageSize);
        setLoading(false);
      });
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...resetDeps, pageSize, debounceMs]);

  // Fetch next page when offset increases
  useEffect(() => {
    if (offset === 0) return;
    setLoading(true);
    fetcherRef.current(pageSize, offset).then((results) => {
      setItems((prev) => [...prev, ...results]);
      setHasMore(results.length === pageSize);
      setLoading(false);
    });
  }, [offset, pageSize]);

  // Observe sentinel to advance offset
  useEffect(() => {
    if (!enabled) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setOffset((prev) => prev + pageSize);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, hasMore, loading, pageSize]);

  return { items, loading, hasMore, sentinelRef };
};
