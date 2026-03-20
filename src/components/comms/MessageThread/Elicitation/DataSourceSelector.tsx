import { FC, useState, useEffect, useRef } from 'react';
import { Select, Spin } from 'antd';
import { DataSource } from 'models/interfaces/dataSource';
import { DataService } from 'services/data';

interface DataSourceSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

const PAGE_SIZE = 20;

export const DataSourceSelector: FC<DataSourceSelectorProps> = ({
  value = [],
  onChange,
  placeholder = 'Search and select datasources...',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadDataSources = async (
    pageNum: number,
    search: string,
    append: boolean = false,
  ) => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await DataService.fetchDataSources({
        page: pageNum,
        size: PAGE_SIZE,
        searchTerm: search,
      });

      if (append) {
        setDataSources((prev) => [...prev, ...result.sources]);
      } else {
        setDataSources(result.sources);
      }

      setHasMore(
        result.sources.length === PAGE_SIZE &&
          result.total > pageNum * PAGE_SIZE,
      );
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    loadDataSources(1, '');
  }, []);

  // Handle search with debounce
  const handleSearch = (search: string) => {
    setSearchTerm(search);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      loadDataSources(1, search);
    }, 500);
  };

  // Handle scroll to load more
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;

    if (isNearBottom && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadDataSources(nextPage, searchTerm, true);
    }
  };

  return (
    <Select
      mode="multiple"
      showSearch
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      onPopupScroll={handlePopupScroll}
      filterOption={false}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : 'No datasources found'}
      optionLabelProp="label"
    >
      {dataSources.map((dataSource) => (
        <Select.Option
          key={dataSource.id}
          value={dataSource.id}
          label={dataSource.name}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{dataSource.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Owner: {dataSource.owner.name} •{' '}
              {dataSource.rowCount?.toLocaleString()} rows •{' '}
              {dataSource.columnCount} columns
            </div>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};
