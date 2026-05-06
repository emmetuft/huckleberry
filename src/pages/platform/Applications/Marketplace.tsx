import { FC, useMemo, useState } from 'react';
import { Menu, MenuProps, Select } from 'antd';
import styles from './Applications.module.css';
import { appCategories, marketplaceApps } from 'constants/applications';
import { AppCard } from './AppCard';
import { useIsMobile } from 'hooks/useIsMobile';

type MenuItem = Required<MenuProps>['items'][number];

interface MarketplaceProps {}

export const Marketplace: FC<MarketplaceProps> = ({}) => {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredApplications = useMemo(
    () =>
      marketplaceApps.filter(
        (app) => selectedCategory === null || app.category === selectedCategory,
      ),
    [selectedCategory],
  );

  const onClickCategory: MenuProps['onClick'] = (e) => {
    const category = e.key === selectedCategory ? null : e.key;
    setSelectedCategory(category);
  };

  const items: MenuItem[] = [
    {
      key: 'categories',
      label: 'Categories',
      type: 'group',
      children: appCategories.map((category) => ({
        key: category,
        label: category,
      })),
    },
  ];

  return (
    <div className={styles.marketplace}>
      <div className={styles.heroBanner} />
      <div className={styles.layout}>
        {!isMobile && (
          <div className={styles.left}>
            <Menu
              selectedKeys={selectedCategory ? [selectedCategory] : []}
              onClick={onClickCategory}
              mode="inline"
              items={items}
            />
          </div>
        )}
        <div className={styles.right}>
          {isMobile && (
            <Select
              placeholder="All categories"
              allowClear
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val ?? null)}
              options={appCategories.map((c) => ({ label: c, value: c }))}
              className={styles.categorySelect}
            />
          )}
          <div className={styles.appGrid}>
            {filteredApplications.map((app) => (
              <AppCard key={app.id} app={app} showAddBtn={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
