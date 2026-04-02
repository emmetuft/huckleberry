import { FC, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input, Menu, MenuProps, Segmented, Spin, Tabs } from 'antd';
import styles from './Integrations.module.css';
import { connectorTypes, integrationCategories } from 'constants/integrations';
import { defaultMotionProps } from 'constants/styles';
import { Connector, ConnectorFilter } from 'models/interfaces/connector';
import { ConnectorCard } from './ConnectorCard';
import { ConnectorsService } from 'services/connectors';
import { buildFilters } from 'utils/data';

type MenuItem = Required<MenuProps>['items'][number];

const PAGE_SIZE = 51;

interface IntegrationsProps {}

export const Integrations: FC<IntegrationsProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
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

  const onClickCategory: MenuProps['onClick'] = (e) => {
    const category = e.key === selectedCategory ? null : e.key;
    setSelectedCategory(category);
  };

  const items: MenuItem[] = [
    {
      key: 'categories',
      label: 'Categories',
      type: 'group',
      children: integrationCategories.map((category) => ({
        key: category,
        label: category,
      })),
    },
  ];

  const [activeTab, setActiveTab] = useState('connected');

  const tabItems = [
    {
      key: 'connected',
      label: 'Connected',
      children: (
        <AnimatePresence mode="wait">
          {activeTab === 'connected' && (
            <motion.div key="connected" {...defaultMotionProps}>
              <div className={styles.integrationGrid} />
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
    {
      key: 'available',
      label: 'Available',
      children: (
        <AnimatePresence mode="wait">
          {activeTab === 'available' && (
            <motion.div
              key="available"
              className={styles.tabPane}
              {...defaultMotionProps}
            >
              <div className={styles.layout}>
                <div className={styles.left}>
                  <Menu
                    selectedKeys={selectedCategory ? [selectedCategory] : []}
                    onClick={onClickCategory}
                    mode="inline"
                    items={items}
                  />
                </div>
                <div className={styles.right}>
                  <Input.Search
                    placeholder="Search connectors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Segmented
                    options={connectorTypes}
                    value={selectedType ?? 'All'}
                    onChange={(val) =>
                      setSelectedType(val === 'All' ? null : (val as string))
                    }
                    size="small"
                    style={{ width: 'fit-content' }}
                  />
                  <div className={styles.gridWrapper}>
                    <div
                      className={`${styles.integrationGrid} ${styles.available}`}
                    >
                      {connectors.map((connector) => (
                        <ConnectorCard
                          key={connector.databaseId}
                          connector={connector}
                          showAddBtn
                        />
                      ))}
                    </div>
                    {loading && (
                      <div className={styles.loadingMore}>
                        <Spin size="small" />
                      </div>
                    )}
                    <div ref={sentinelRef} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
  ];

  return (
    <div className={styles.Integrations}>
      <Tabs
        items={tabItems}
        defaultActiveKey="connected"
        animated={false}
        onChange={setActiveTab}
      />
    </div>
  );
};
