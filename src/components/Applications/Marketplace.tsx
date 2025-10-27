import { FC, useMemo, useState } from 'react';
import { Menu, MenuProps } from 'antd';
import styles from './Applications.module.scss';
import { appCategories, marketplaceApps } from 'constants/applications';
import { AppCard } from './AppCard';

type MenuItem = Required<MenuProps>['items'][number];

interface MarketplaceProps {}

export const Marketplace: FC<MarketplaceProps> = ({}) => {
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
    <div className={styles.Marketplace}>
      <div className={styles.heroBanner} />
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
