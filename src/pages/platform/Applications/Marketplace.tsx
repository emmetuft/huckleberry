import { FC, useMemo, useState } from 'react';
import { Select } from 'antd';
import styles from './Applications.module.css';
import {
  AppCategory,
  appCategories,
  marketplaceApps,
} from 'constants/applications';
import { AppCard } from './AppCard';
import { useIsMobile } from 'hooks/useIsMobile';

interface MarketplaceProps {}

export const Marketplace: FC<MarketplaceProps> = ({}) => {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(
    null,
  );

  const filteredApplications = useMemo(
    () =>
      marketplaceApps.filter(
        (app) => selectedCategory === null || app.category === selectedCategory,
      ),
    [selectedCategory],
  );

  return (
    <div className={styles.marketplace}>
      <div className={styles.appGrid}>
        {filteredApplications.map((app) => (
          <AppCard key={app.id} app={app} showAddBtn={true} />
        ))}
      </div>
    </div>
  );
};
