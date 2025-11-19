import { FC, useState, useEffect, useRef } from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './SearchBar.module.scss';
import { Neo4jNode } from 'models/interfaces/ontology';
import { useSelector } from 'react-redux';
import { selectNodeLabels } from 'reducers/ontology/slice';

interface SearchBarProps {
  nodes: Neo4jNode[];
  onNodeFound: (node: Neo4jNode) => void;
  onSearchClear: () => void;
  onLabelFilterChange?: (labels: string[]) => void;
  highlightedNodeId?: string | null;
}

export const SearchBar: FC<SearchBarProps> = ({
  nodes,
  onNodeFound,
  onSearchClear,
  onLabelFilterChange,
  highlightedNodeId,
}) => {
  const nodeLabels = useSelector(selectNodeLabels);

  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!highlightedNodeId) {
      setSearchValue('');
    }
  }, [highlightedNodeId]);

  const performSearch = (value: string) => {
    if (!value.trim()) {
      onSearchClear();
      return;
    }

    const searchLower = value.toLowerCase().trim();

    // Search by ID first (exact match)
    const nodeById = nodes.find((node) => node.id === value);
    if (nodeById) {
      onNodeFound(nodeById);
      return;
    }

    // Search by name (partial match)
    const nodeByName = nodes.find(
      (node) =>
        node.properties.name &&
        node.properties.name.toLowerCase().includes(searchLower),
    );
    if (nodeByName) {
      onNodeFound(nodeByName);
      return;
    }

    // If no match found, clear highlight
    onSearchClear();
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If empty, clear immediately without debounce
    if (!value.trim()) {
      onSearchClear();
      return;
    }

    // Debounce the search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 500); // 500ms delay
  };

  // Handle label filter change
  const handleLabelFilterChange = (labels: string[]) => {
    setSelectedLabels(labels);
    if (onLabelFilterChange) {
      onLabelFilterChange(labels);
    }
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
        placeholder="Search by node ID or name..."
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        onClear={onSearchClear}
        className={styles.searchInput}
      />
      <Select
        mode="multiple"
        placeholder="Filter by node label..."
        value={selectedLabels}
        onChange={handleLabelFilterChange}
        options={nodeLabels.map((label) => ({ label, value: label }))}
        allowClear
        className={styles.labelSelect}
        maxTagCount="responsive"
      />
    </div>
  );
};
