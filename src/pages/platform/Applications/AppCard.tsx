import { FC } from 'react';
import { Tag } from 'antd';
import { CubeIcon, PlusIcon, StarIcon } from '@phosphor-icons/react';
import styles from './Applications.module.css';
import { Application } from 'models/interfaces/application';

interface AppCardProps {
  app: Application;
  showAddBtn?: boolean;
}

export const AppCard: FC<AppCardProps> = ({ app, showAddBtn }) => {
  return (
    <div className="appCard">
      {app.iconUrl ? (
        <img src={app.iconUrl} height="100%" width="100%" />
      ) : (
        <div className={`defaultAppIcon ${styles.appIcon}`}>
          <CubeIcon color="white" size={18} />
        </div>
      )}
      <div className="appInfo">
        <div className={styles.appDetails}>
          <h4>{app.name}</h4>
          {app.favorite && <StarIcon weight="fill" color="var(--purple)" />}
        </div>
        <p>{app.description}</p>
        <div className={styles.appDetails}>
          {showAddBtn && (
            <Tag className="defaultTag">
              <PlusIcon />
              Install
            </Tag>
          )}
          <Tag>{app.category}</Tag>
        </div>
      </div>
    </div>
  );
};
