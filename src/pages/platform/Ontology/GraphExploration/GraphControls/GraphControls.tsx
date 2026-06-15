import { FC, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Input, Select, Popover, Button, Badge, Spin } from 'antd';
import {
  ClockCountdownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import styles from './GraphControls.module.css';
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
import { fetchNodes } from 'reducers/ontology/actions';
import { VALUE_QUERY_LIMIT } from 'constants/service';
import { Filter } from 'models/interfaces/filter';
import { FilterPopup } from 'components/shared/FilterPopup/FilterPopup';
import { GraphPlayback } from './GraphPlayback/GraphPlayback';
import { GraphService } from 'services/graph';
import {
  buildFilterColumns,
  filtersToGraphConditions,
  graphConditionsToFilters,
} from 'utils/ontology';

interface GraphControlsProps {
  onPlaybackChange: (visibleNodeIds: Set<string> | null) => void;
}

export const GraphControls: FC<GraphControlsProps> = ({ onPlaybackChange }) => {
  const dispatch = useAppDispatch();
  const nodeLabels = useSelector(selectNodeLabels);
  const graphData = useSelector(selectGraphData);
  const highlightedNodeId = useSelector(selectHighlightedNodeId);
  const selectedLabels = useSelector(selectLabelFilters);
  const activeFilters = useSelector(selectPropertyFilters);
  const loading = useSelector(selectLoading);

  const [searchValue, setSearchValue] = useState<string>('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<boolean>(false);
  const [playbackOpen, setPlaybackOpen] = useState<boolean>(false);
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

    // TODO: If not found in current graph, search Neo4j database and load results
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

  // TODO: Get all graph labels via API
  const labelsInGraph = [...new Set(graphData.nodes.flatMap((n) => n.labels))];
  const filterColumns = buildFilterColumns(graphData.nodes, labelsInGraph);

  const handleLoadOptions = async (columnKey: string) => {
    const colonIdx = columnKey.indexOf(':');
    if (colonIdx === -1) return [];
    const nodeLabel = columnKey.substring(0, colonIdx);
    const property = columnKey.substring(colonIdx + 1);
    const values = await GraphService.getPropertyValues(
      nodeLabel,
      property,
      VALUE_QUERY_LIMIT,
    );
    return values.length < VALUE_QUERY_LIMIT
      ? values.map((v: any) => ({ label: String(v), value: v }))
      : [];
  };

  const handleApplyFilters = (filters: Filter[]) => {
    dispatch(
      fetchNodes({
        filters: filtersToGraphConditions(filters, graphData.nodes),
      }),
    );
    setFilterPopoverOpen(false);
  };

  return (
    <div className={`${styles.graphControls} card`}>
      <div className={styles.top}>
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
        <Input
          placeholder="Filter by name or ID"
          prefix={<MagnifyingGlassIcon />}
          suffix={loading.searching ? <Spin size="small" /> : null}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
          onClear={() => dispatch(clearHighlightedNode())}
          className={styles.searchInput}
        />
        <Popover
          content={
            <FilterPopup
              columns={filterColumns}
              initialFilters={graphConditionsToFilters(activeFilters)}
              onLoadOptions={handleLoadOptions}
              onApply={handleApplyFilters}
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
              shape="round"
              icon={<FunnelIcon />}
              className={styles.filterButton}
              type={activeFilters.length > 0 ? 'primary' : 'default'}
            >
              Filters
            </Button>
          </Badge>
        </Popover>
        <Button
          shape="round"
          type={playbackOpen ? 'primary' : 'default'}
          icon={<ClockCountdownIcon />}
          onClick={() => {
            const next = !playbackOpen;
            setPlaybackOpen(next);
            if (!next) onPlaybackChange(null);
          }}
        />
      </div>
      <div
        className={`${styles.playbackDrawer} ${playbackOpen ? styles.open : ''}`}
      >
        <GraphPlayback
          isOpen={playbackOpen}
          onPlaybackChange={onPlaybackChange}
        />
      </div>
    </div>
  );
};
