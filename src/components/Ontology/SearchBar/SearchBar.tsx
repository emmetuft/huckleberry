import { FC, useState, useEffect, useRef } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './SearchBar.module.scss';
import { Neo4jNode } from 'models/interfaces/ontology';

interface SearchBarProps {
  nodes: Neo4jNode[];
  onNodeFound: (node: Neo4jNode) => void;
  onSearchClear: () => void;
}

export const SearchBar: FC<SearchBarProps> = ({
  nodes,
  onNodeFound,
  onSearchClear,
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        size="large"
      />
    </div>
  );
};
