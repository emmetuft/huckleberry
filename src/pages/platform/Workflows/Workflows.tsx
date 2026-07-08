import { FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Spin, Tag } from 'antd';
import { FlowArrowIcon, PlusIcon } from '@phosphor-icons/react';
import styles from './Workflows.module.css';
import { selectIdentity } from 'reducers/app/slice';
import { defaultMotionProps } from 'constants/styles';
import { FEATURED_WORKFLOWS } from 'constants/workflows';
import { Workflow } from 'models/interfaces/workflow';
import { PageControls } from 'components/shared/PageControls/PageControls';
import { WorkflowCard } from './WorkflowCard';
import { WorkflowsService } from 'services/workflow';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';
import { buildFilters } from 'utils/workflows';

export const Workflows: FC = () => {
  const identity = useSelector(selectIdentity);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('yours');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('all');

  const fetchWorkflows = useCallback(
    (limit: number, offset: number) => {
      const filters = buildFilters(
        activeTab,
        identity ? identity.id.toString() : null,
        selectedTrigger,
        searchQuery,
      );
      return WorkflowsService.getWorkflows(filters, limit, offset);
    },
    [activeTab, identity, selectedTrigger, searchQuery],
  );

  const {
    items: workflows,
    loading,
    sentinelRef,
  } = useInfiniteScroll<Workflow>({
    fetcher: fetchWorkflows,
    resetDeps: [activeTab, selectedTrigger, searchQuery],
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
          activeTab === 'yours' ? 'Search your workflows' : 'Search workflows'
        }
        filters={[
          {
            value: selectedTrigger,
            onChange: (val) => setSelectedTrigger(val ?? 'all'),
            options: [
              { label: 'Any trigger', value: 'all' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Data update', value: 'data_update' },
              { label: 'Webhook', value: 'webhook' },
              { label: 'File upload', value: 'file_upload' },
              { label: 'Form submission', value: 'form' },
              { label: 'Manual', value: 'manual' },
            ],
          },
        ]}
        cornerComponent={
          <Button
            icon={<PlusIcon />}
            shape="round"
            type="primary"
            onClick={() => navigate('/workflows/new')}
          >
            Create workflow
          </Button>
        }
      />
      <AnimatePresence mode="wait">
        {activeTab === 'yours' && !loading && workflows.length === 0 ? (
          <motion.div key="yours-empty" {...defaultMotionProps}>
            <div className={styles.emptyWrapper}>
              <FlowArrowIcon size={36} />
              <p>
                Workflows orchestrate agents, tools, and data to automate
                multi-step processes across your workspace.
              </p>
              <p>You haven't created any workflows yet.</p>
              <Button
                icon={<PlusIcon />}
                shape="round"
                type="primary"
                onClick={() => navigate('/workflows/new')}
              >
                Create
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={activeTab} {...defaultMotionProps}>
            {activeTab === 'all' && (
              <div className={styles.featuredSection}>
                <div className={styles.heading}>
                  <h3>Featured</h3>
                  <Tag className="defaultTag">Beta</Tag>
                </div>
                <div className={styles.featuredItems}>
                  {FEATURED_WORKFLOWS.map((workflow) => (
                    <div key={workflow.uuid} className={styles.item}>
                      <div className={styles.colorBlock} />
                      <div className={styles.details}>
                        <p className={styles.title}>{workflow.name}</p>
                        <p className={styles.description}>
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.workflowGrid}>
              {workflows.map((workflow) => (
                <WorkflowCard key={workflow.uuid} workflow={workflow} />
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
