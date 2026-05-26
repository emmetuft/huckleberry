import { FC, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Spin } from 'antd';
import styles from './Integrations.module.css';
import {
  ConnectorCategory,
  ConnectorType,
  connectorCategories,
  connectorTypes,
} from 'constants/integrations';
import { defaultMotionProps } from 'constants/styles';
import { Connector, ConnectorFilter } from 'models/interfaces/connector';
import { PageControls } from 'components/shared/PageControls/PageControls';
import { ConnectorCard } from './ConnectorCard';
import { ConnectorTable } from './ConnectorTable';
import { ConnectorsService } from 'services/connectors';
import { buildFilters } from 'utils/data';

const PAGE_SIZE = 48;

interface IntegrationsProps {}

export const Integrations: FC<IntegrationsProps> = () => {
  const [activeTab, setActiveTab] = useState<string>('connected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ConnectorCategory | null>(null);
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersRef = useRef<ConnectorFilter[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // When filters change: reset and fetch first page
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters = buildFilters(selectedCategory, selectedType, searchQuery);
      filtersRef.current = filters;
      setConnectors([]);
      setOffset(0);
      setHasMore(true);
      setLoading(true);
      ConnectorsService.fetchConnectors(filters, PAGE_SIZE, 0).then(
        (results) => {
          setConnectors(results);
          setHasMore(results.length === PAGE_SIZE);
          setLoading(false);
        },
      );
    }, 300);
  }, [selectedCategory, selectedType, searchQuery]);

  // When offset increases: fetch next page and append
  useEffect(() => {
    if (offset === 0) return;
    setLoading(true);
    ConnectorsService.fetchConnectors(
      filtersRef.current,
      PAGE_SIZE,
      offset,
    ).then((results) => {
      setConnectors((prev) => [...prev, ...results]);
      setHasMore(results.length === PAGE_SIZE);
      setLoading(false);
    });
  }, [offset]);

  // IntersectionObserver on sentinel to trigger next page
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setOffset((prev) => prev + PAGE_SIZE);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <>
      <PageControls
        tabs={[
          { label: 'Connected', value: 'connected' },
          { label: 'Available', value: 'available' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === 'connected'
            ? 'Search your connectors'
            : 'Search connectors'
        }
        filters={[
          {
            value: selectedCategory,
            onChange: (val) => setSelectedCategory(val ?? null),
            options: [
              { label: 'Any category', value: null },
              ...connectorCategories.map((c) => ({
                label: c.label,
                value: c.value,
              })),
            ],
          },
          {
            value: selectedType,
            onChange: (val) => setSelectedType(val ?? null),
            options: [
              { label: 'Any type', value: null },
              ...connectorTypes.map((t) => ({
                label: t.label,
                value: t.value,
              })),
            ],
          },
        ]}
      />
      {activeTab === 'connected' ? (
        <AnimatePresence>
          <motion.div key="connected" {...defaultMotionProps}>
            <ConnectorTable />
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          <motion.div key="available" {...defaultMotionProps}>
            <div className={styles.integrationGrid}>
              {connectors.map((connector) => (
                <ConnectorCard
                  key={connector.databaseId}
                  connector={connector}
                />
              ))}
            </div>
            {loading && (
              <div className={styles.loadingMore}>
                <Spin size="small" />
              </div>
            )}
            <div ref={sentinelRef} />
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};
