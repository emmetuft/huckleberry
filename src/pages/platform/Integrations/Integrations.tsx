import { FC, useCallback, useState } from 'react';
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
import { Connector } from 'models/interfaces/connector';
import { PageControls } from 'components/shared/PageControls/PageControls';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';
import { ConnectorCard } from './ConnectorCard';
import { ConnectorTable } from './ConnectorTable';
import { ConnectorsService } from 'services/connectors';
import { buildFilters } from 'utils/data';

interface IntegrationsProps {}

export const Integrations: FC<IntegrationsProps> = () => {
  const [activeTab, setActiveTab] = useState<string>('connected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ConnectorCategory | 'all'
  >('all');
  const [selectedType, setSelectedType] = useState<ConnectorType | 'all'>(
    'all',
  );

  const fetchConnectors = useCallback(
    (limit: number, offset: number) => {
      const filters = buildFilters(selectedCategory, selectedType, searchQuery);
      return ConnectorsService.getConnectors(filters, limit, offset);
    },
    [selectedCategory, selectedType, searchQuery],
  );

  const {
    items: connectors,
    loading,
    sentinelRef,
  } = useInfiniteScroll<Connector>({
    fetcher: fetchConnectors,
    resetDeps: [selectedCategory, selectedType, searchQuery],
    enabled: activeTab === 'available',
  });

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
              { label: 'Any category', value: 'all' },
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
              { label: 'Any type', value: 'all' },
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
