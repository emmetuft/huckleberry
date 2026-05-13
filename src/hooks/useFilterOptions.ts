import { useCallback, useRef, useState } from 'react';
import { COLUMN_FILTER_RESULTS_LIMIT, DEBOUNCE_DELAY } from 'constants/data';
import { Filter } from 'models/interfaces/filter';

type Args = {
  columnName: string;
  filters: Filter[];
};

export const useFilterOptions = ({ columnName, filters }: Args) => {
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [counter, setCounter] = useState(0);
  const [searchOn, setSearchOn] = useState(false);
  const refLocalResults = useRef<any[] | undefined>();

  const doSearch = useCallback(async (term: string, reset: boolean) => {
    setSearchOn(term !== '');
    if (refLocalResults.current !== undefined) {
      setQueryResults(
        refLocalResults.current.filter((value) =>
          `${value}`.toLowerCase().includes(term.toLowerCase()),
        ),
      );
      return;
    }
    setCounter((current) => current + 1);
    const results: any[] = []; // TODO: Fetch results from duckDB

    // Happens once
    if (
      reset === true &&
      refLocalResults.current === undefined &&
      results.length < COLUMN_FILTER_RESULTS_LIMIT
    ) {
      refLocalResults.current = results;
    }

    setQueryResults(results);
    setCounter((current) => current - 1);
  }, []);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debounceDoSearch = useCallback(
    debounce((searchValue: string) => {
      doSearch(searchValue, false);
    }, DEBOUNCE_DELAY),
    [doSearch],
  );

  const reset = useCallback(() => {
    doSearch('', true);
  }, []);

  return [
    counter > 0,
    queryResults,
    debounceDoSearch,
    reset,
    searchOn,
  ] as const;
};
