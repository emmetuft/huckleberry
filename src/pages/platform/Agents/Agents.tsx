import { FC, useState } from 'react';
import styles from './Agents.module.css';
import { agentCategories, AgentCategory, AgentList } from 'constants/agent';
import { PageControls } from 'components/shared/PageControls/PageControls';
import { AnimatePresence, motion } from 'framer-motion';
import { defaultMotionProps } from 'constants/styles';
import { AgentCard } from './AgentCard';

export const Agents: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('yours');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<AgentCategory | null>(null);

  return (
    <>
      <PageControls
        tabs={[
          { label: 'Yours', value: 'yours' },
          { label: 'Available', value: 'available' },
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
              { label: 'Any category', value: null },
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
            temp
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          <motion.div key="available" {...defaultMotionProps}>
            <div className={styles.agentGrid}>
              {AgentList.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            {/* {loading && (
              <div className={styles.loadingMore}>
                <Spin size="small" />
              </div>
            )}
            <div ref={sentinelRef} /> */}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};
