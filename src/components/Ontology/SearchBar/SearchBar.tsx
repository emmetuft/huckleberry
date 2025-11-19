import { FC, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Input, Select, Popover, Button, Badge } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import styles from './SearchBar.module.scss';
import { useAppDispatch } from 'reducers';
import {
  selectNodeLabels,
  selectGraphData,
  selectHighlightedNodeId,
  selectLabelFilters,
  selectPropertyFilters,
  setHighlightedNode,
  clearHighlightedNode,
  setLabelFilters,
  setPropertyFilters,
} from 'reducers/ontology/slice';
import { FilterCondition } from 'models/enums/filters';
import { FilterPopup } from './FilterPopup';

interface SearchBarProps {}

export const SearchBar: FC<SearchBarProps> = ({}) => {
  const dispatch = useAppDispatch();
  const nodeLabels = useSelector(selectNodeLabels);
  const graphData = useSelector(selectGraphData);
  const highlightedNodeId = useSelector(selectHighlightedNodeId);
  const selectedLabels = useSelector(selectLabelFilters);
  const activeFilters = useSelector(selectPropertyFilters);

  const [searchValue, setSearchValue] = useState<string>('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!highlightedNodeId) {
      setSearchValue('');
    }
  }, [highlightedNodeId]);

  const performSearch = (value: string) => {
    if (!value.trim()) {
      dispatch(clearHighlightedNode());
      return;
    }

    const searchLower = value.toLowerCase().trim();

    // Search by ID first (exact match)
    const nodeById = graphData.nodes.find((node) => node.id === value);
    if (nodeById) {
      dispatch(setHighlightedNode(nodeById.id));
      return;
    }

    // Search by name (partial match)
    const nodeByName = graphData.nodes.find(
      (node) =>
        node.properties.name &&
        node.properties.name.toLowerCase().includes(searchLower),
    );
    if (nodeByName) {
      dispatch(setHighlightedNode(nodeByName.id));
      return;
    }

    // If no match found, clear highlight
    dispatch(clearHighlightedNode());
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If empty, clear immediately without debounce
    if (!value.trim()) {
      dispatch(clearHighlightedNode());
      return;
    }

    // Debounce the search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 500); // 500ms delay
  };

  // Handle label filter change
  const handleLabelFilterChange = (labels: string[]) => {
    dispatch(setLabelFilters(labels));
  };

  // Handle property filter change
  const handlePropertyFilterChange = (filters: FilterCondition[]) => {
    dispatch(setPropertyFilters(filters));
    setFilterPopoverOpen(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.SearchBar}>
      <Input
        placeholder="Search by node ID or name"
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        onClear={() => dispatch(clearHighlightedNode())}
        className={styles.searchInput}
      />
      <Select
        mode="multiple"
        placeholder="Filter nodes by label"
        value={selectedLabels}
        onChange={handleLabelFilterChange}
        options={nodeLabels.map((label) => ({ label, value: label }))}
        allowClear
        className={styles.labelSelect}
        maxTagCount="responsive"
      />
      <Popover
        content={
          <FilterPopup
            nodes={graphData.nodes}
            nodeLabels={nodeLabels}
            onApplyFilters={handlePropertyFilterChange}
          />
        }
        title="Filter Graph Data"
        trigger="click"
        open={filterPopoverOpen}
        onOpenChange={setFilterPopoverOpen}
        placement="bottomRight"
      >
        <Badge count={activeFilters.length} offset={[-5, 5]}>
          <Button
            icon={<FilterOutlined />}
            className={styles.filterButton}
            type={activeFilters.length > 0 ? 'primary' : 'default'}
          >
            Filters
          </Button>
        </Badge>
      </Popover>
    </div>
  );
};
