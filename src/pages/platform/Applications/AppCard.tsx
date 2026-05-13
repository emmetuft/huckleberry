import { FC } from 'react';
import { CubeIcon, PlusIcon } from '@phosphor-icons/react';
// import styles from './Applications.module.css';
import { Application } from 'models/interfaces/application';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';

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
        <div className="defaultAppIcon">
          <CubeIcon color="white" size={18} />
        </div>
      )}
      <div className="appInfo">
        <h4>{app.name}</h4>
        <p>{app.description}</p>
      </div>
      {showAddBtn && (
        <div className="quickAdd">
          <IconBtn icon={<PlusIcon />} />
        </div>
      )}
    </div>
  );
};
