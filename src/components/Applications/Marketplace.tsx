import { FC } from 'react';
import { Menu, MenuProps } from 'antd';
import styles from './Applications.module.scss';
import { appCategories, appList } from 'constants/applications';
import { AppCard } from './AppCard';

type MenuItem = Required<MenuProps>['items'][number];

interface MarketplaceProps {}

export const Marketplace: FC<MarketplaceProps> = ({}) => {
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
            //   onClick={onClick}
            mode="inline"
            items={items}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.appGrid}>
            {appList.map((app) => (
              <AppCard key={app.id} app={app} showAddBtn={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
