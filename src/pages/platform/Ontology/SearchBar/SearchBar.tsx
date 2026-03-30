import { FC, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Input, Select, Popover, Button, Badge } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import styles from './SearchBar.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectNodeLabels,
  selectGraphData,
  selectHighlightedNodeId,
  selectLabelFilters,
  selectPropertyFilters,
  selectLoading,
  setHighlightedNode,
  clearHighlightedNode,
} from 'reducers/ontology/slice';
import { fetchNodes, searchAndLoadNodes } from 'reducers/ontology/actions';
import { FilterCondition } from 'models/interfaces/graphFilter';
import { FilterPopup } from './FilterPopup';

const { Search } = Input;

interface SearchBarProps {}

export const SearchBar: FC<SearchBarProps> = ({}) => {
  const dispatch = useAppDispatch();
  const nodeLabels = useSelector(selectNodeLabels);
  const graphData = useSelector(selectGraphData);
  const highlightedNodeId = useSelector(selectHighlightedNodeId);
  const selectedLabels = useSelector(selectLabelFilters);
  const activeFilters = useSelector(selectPropertyFilters);
  const loading = useSelector(selectLoading);

  const [searchValue, setSearchValue] = useState<string>('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!highlightedNodeId) {
      setSearchValue('');
    }
  }, [highlightedNodeId]);

  const performSearch = async (value: string) => {
    if (!value.trim()) {
      dispatch(clearHighlightedNode());
      return;
    }

    const searchLower = value.toLowerCase().trim();

    // First check if the search term matches any node already in the graph
    const nodeById = graphData.nodes.find((node) => node.id === value);
    if (nodeById) {
      dispatch(setHighlightedNode(nodeById.id));
      return;
    }

    const nodeByName = graphData.nodes.find(
      (node) =>
        node.properties.name &&
        node.properties.name.toLowerCase().includes(searchLower),
    );
    if (nodeByName) {
      dispatch(setHighlightedNode(nodeByName.id));
      return;
    }

    // If not found in current graph, search Neo4j database and load results
    dispatch(
      searchAndLoadNodes({
        query: searchLower,
        limit: 20,
      }),
    );
  };

  useEffect(() => {
    // If empty, clear immediately without debounce
    if (!searchValue.trim()) {
      dispatch(clearHighlightedNode());
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchValue);
    }, 500); // 500ms delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchValue]);

  const handleLabelFilterChange = async (labels: string[]) => {
    dispatch(fetchNodes({ labels }));
  };

  const handleApplyFilters = (filters: FilterCondition[]) => {
    dispatch(fetchNodes({ filters }));
    setFilterPopoverOpen(false);
  };

  return (
    <div className={`${styles.SearchBar} card`}>
      <Select
        mode="multiple"
        placeholder="Select node label(s)"
        loading={loading.fetchNodeLabels}
        value={selectedLabels}
        onChange={handleLabelFilterChange}
        options={nodeLabels.map((label) => ({ label, value: label }))}
        allowClear
        className={styles.labelSelect}
        maxTagCount="responsive"
      />
      <Search
        placeholder="Filter by name or ID"
        loading={loading.searching}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        allowClear
        onClear={() => dispatch(clearHighlightedNode())}
        className={styles.searchInput}
      />
      <Popover
        content={
          <FilterPopup
            nodes={graphData.nodes}
            onApplyFilters={handleApplyFilters}
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
