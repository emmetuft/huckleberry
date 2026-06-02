import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Applications.module.css';
import { appCategories, AppCategory, appList } from 'constants/applications';
import { defaultMotionProps } from 'constants/styles';
import { PageControls } from 'components/shared/PageControls/PageControls';
import { AppCard } from './AppCard';
import { Marketplace } from './Marketplace';

interface ApplicationsProps {}

export const Applications: FC<ApplicationsProps> = ({}) => {
  const [activeTab, setActiveTab] = useState<string>('yours');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>(
    'all',
  );

  return (
    <div className="platformPage">
      <PageControls
        tabs={[
          { label: 'Your apps', value: 'yours' },
          { label: 'Marketplace', value: 'marketplace' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === 'yours' ? 'Search your apps' : 'Search apps'
        }
        filters={[
          {
            value: selectedCategory,
            onChange: (val) => setSelectedCategory(val ?? null),
            options: [
              { label: 'Any category', value: 'all' },
              ...appCategories.map((c) => ({
                label: c.label,
                value: c.value,
              })),
            ],
          },
        ]}
      />
      {activeTab === 'yours' ? (
        <div className={styles.tabContent}>
          <motion.div {...defaultMotionProps}>
            <div className={styles.appGrid}>
              {appList.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div {...defaultMotionProps}>
          <Marketplace />
        </motion.div>
      )}
    </div>
  );
};
