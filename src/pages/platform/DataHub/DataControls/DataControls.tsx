import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Input, Popover, Spin } from 'antd';
import { FunnelIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import styles from './DataControls.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectDataSourceFilters,
  selectDataSourceLoading,
  setDataSourceFilters,
} from 'reducers/datasource/slice';
import { fetchDataSourceList } from 'reducers/datasource/actions';
import { Filter } from 'models/interfaces/filter';
import { FilterPopup } from 'components/shared/FilterPopup/FilterPopup';
import { DATA_SOURCE_FILTER_COLUMNS } from 'constants/dataSourceFilters';
import { PeopleService } from 'services/people';

export const DataControls: FC = () => {
  const dispatch = useAppDispatch();
  const filters = useSelector(selectDataSourceFilters);
  const loading = useSelector(selectDataSourceLoading).dataSourceList;

  const [searchValue, setSearchValue] = useState<string>('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchValue.trim()) {
      dispatch(fetchDataSourceList({ page: 1, size: 20 }));
      return;
    }

    debounceRef.current = setTimeout(() => {
      dispatch(
        fetchDataSourceList({
          page: 1,
          size: 20,
          searchTerm: searchValue.trim(),
        }),
      );
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue]);

  const handleLoadOptions = async (columnKey: string) => {
    if (columnKey === 'owner') {
      const users = await PeopleService.getUsers();
      return users
        .filter((u) => u.displayName)
        .map((u) => ({ label: u.displayName!, value: u.displayName! }));
    }
    return [];
  };

  const handleApplyFilters = (appliedFilters: Filter[]) => {
    dispatch(setDataSourceFilters(appliedFilters));
    setFilterPopoverOpen(false);
  };

  return (
    <div className={styles.dataControls}>
      <Input
        placeholder="Search"
        prefix={<MagnifyingGlassIcon />}
        suffix={loading ? <Spin size="small" /> : null}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        allowClear
        onClear={() => setSearchValue('')}
        className={styles.searchInput}
      />
      <Popover
        content={
          <FilterPopup
            columns={DATA_SOURCE_FILTER_COLUMNS}
            initialFilters={filters}
            onLoadOptions={handleLoadOptions}
            onApply={handleApplyFilters}
          />
        }
        title="Filter Data"
        trigger="click"
        open={filterPopoverOpen}
        onOpenChange={setFilterPopoverOpen}
        placement="bottomRight"
      >
        <Badge count={filters.length} offset={[-5, 5]}>
          <Button
            icon={<FunnelIcon />}
            className={styles.filterButton}
            type={filters.length > 0 ? 'primary' : 'default'}
          >
            Filters
          </Button>
        </Badge>
      </Popover>
    </div>
  );
};
