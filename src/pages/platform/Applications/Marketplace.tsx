import { FC, useMemo, useState } from 'react';
import styles from './Applications.module.css';
import { AppCategory, marketplaceApps } from 'constants/applications';
import { AppCard } from './AppCard';

interface MarketplaceProps {}

export const Marketplace: FC<MarketplaceProps> = ({}) => {
  const [selectedCategory] = useState<AppCategory | null>(null);

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
