import { FC, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LightningIcon, PlusIcon } from '@phosphor-icons/react';
import { Button, Spin } from 'antd';
import styles from './Agents.module.css';
import { agentCategories, AgentCategory } from 'constants/agent';
import { defaultMotionProps } from 'constants/styles';
import { Agent } from 'models/interfaces/agent';
import { PageControls } from 'components/shared/PageControls/PageControls';
import { AgentService } from 'services/agent';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';
import { AgentCard } from './AgentCard';

export const Agents: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('yours');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    AgentCategory | 'all'
  >('all');

  const {
    items: agents,
    loading,
    sentinelRef,
  } = useInfiniteScroll<Agent>({
    fetcher: AgentService.getAgents,
    resetDeps: [selectedCategory, searchQuery],
    enabled: activeTab === 'all',
  });

  return (
    <>
      <PageControls
        tabs={[
          { label: 'Yours', value: 'yours' },
          { label: 'All', value: 'all' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === 'yours' ? 'Search your agents' : 'Search agents'
        }
        filters={[
          {
            value: selectedCategory,
            onChange: (val) => setSelectedCategory(val ?? null),
            options: [
              { label: 'Any category', value: 'all' },
              ...agentCategories.map((c) => ({
                label: c.label,
                value: c.value,
              })),
            ],
          },
        ]}
      />
      {activeTab === 'yours' ? (
        <AnimatePresence>
          <motion.div key="yours" {...defaultMotionProps}>
            <div className={styles.emptyWrapper}>
              <LightningIcon size={36} />
              <p>
                Agents are like smart, flexible assistants or specialists with
                knowledge, goals and access to tools.
              </p>
              <p>You haven't created any agents yet.</p>
              <Button icon={<PlusIcon />} shape="round" type="primary">
                Create
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          <motion.div key="all" {...defaultMotionProps}>
            <div className={styles.agentGrid}>
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
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
