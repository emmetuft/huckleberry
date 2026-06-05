import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Spin } from 'antd';
import { LightningIcon, PlusIcon } from '@phosphor-icons/react';
import styles from './Agents.module.css';
import { selectIdentity } from 'reducers/app/slice';
import { setAgents } from 'reducers/agents/slice';
import { agentCategories, AgentCategory } from 'constants/agent';
import { defaultMotionProps } from 'constants/styles';
import { Agent } from 'models/interfaces/agent';
import { PageControls } from 'components/shared/PageControls/PageControls';
import { AgentCard } from './AgentCard';
import { AgentService } from 'services/agent';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

export const Agents: FC = () => {
  const dispatch = useDispatch();
  const identity = useSelector(selectIdentity);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('yours');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    AgentCategory | 'all'
  >('all');

  type AgentFilter = { type: string; values: any[] };

  const filters = useMemo<AgentFilter[] | undefined>(() => {
    if (activeTab === 'yours') {
      return [{ type: 'OWNER', values: [identity?.id?.toString() ?? ''] }];
    }
    return undefined;
  }, [activeTab, identity]);

  const fetchAgents = useCallback(
    (limit: number, offset: number) => {
      return AgentService.getAgents(limit, offset, filters);
    },
    [filters],
  );

  const {
    items: agents,
    loading,
    sentinelRef,
  } = useInfiniteScroll<Agent>({
    fetcher: fetchAgents,
    resetDeps: [selectedCategory, searchQuery, filters],
  });

  useEffect(() => {
    if (agents.length > 0) {
      dispatch(setAgents(agents));
    }
  }, [agents, dispatch]);

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
        cornerComponent={
          <Button
            icon={<PlusIcon />}
            shape="round"
            type="primary"
            onClick={() => navigate('/agents/new/edit')}
          >
            Create agent
          </Button>
        }
      />
      <AnimatePresence mode="wait">
        {activeTab === 'yours' && !loading && agents.length === 0 ? (
          <motion.div key="yours-empty" {...defaultMotionProps}>
            <div className={styles.emptyWrapper}>
              <LightningIcon size={36} />
              <p>
                Agents are like smart, flexible assistants or specialists with
                knowledge, goals and access to tools.
              </p>
              <p>You haven't created any agents yet.</p>
              <Button
                icon={<PlusIcon />}
                shape="round"
                type="primary"
                onClick={() => navigate('/agents/new/edit')}
              >
                Create
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={activeTab} {...defaultMotionProps}>
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
        )}
      </AnimatePresence>
    </>
  );
};
