import { FC } from 'react';
import { Cube, Plus } from 'phosphor-react';
import { Menu, MenuProps } from 'antd';
import styles from './Applications.module.scss';
import { Application } from 'models/interfaces/application';
import { appCategories, appList } from 'constants/applications';
import { IconBtn } from 'components/IconBtn/IconBtn';

type MenuItem = Required<MenuProps>['items'][number];

interface MarketplaceProps {}

export const Marketplace: FC<MarketplaceProps> = ({}) => {
  const renderApp = (app: Application) => (
    <div key={app.id} className={styles.appCard}>
      {app.iconUrl ? (
        <img src={app.iconUrl} height="100%" width="100%" />
      ) : (
        <div className={styles.defaultAppIcon}>
          <Cube color="white" size={18} />
        </div>
      )}
      <div className={styles.appInfo}>
        <h4>{app.name}</h4>
        <p>{app.description}</p>
      </div>
      <div className={styles.quickAdd}>
        <IconBtn icon={<Plus />} />
      </div>
    </div>
  );

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
            {appList.map((app) => renderApp(app))}
          </div>
        </div>
      </div>
    </div>
  );
};
