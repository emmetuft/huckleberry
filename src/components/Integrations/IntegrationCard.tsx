import { FC } from 'react';
import { Cube, Plus } from 'phosphor-react';
import styles from './Applications.module.scss';
import { IconBtn } from 'components/IconBtn/IconBtn';
import { Integration } from 'models/interfaces/integration';

interface IntegrationCardProps {
  integration: Integration;
  showAddBtn?: boolean;
}

export const IntegrationCard: FC<IntegrationCardProps> = ({
  integration,
  showAddBtn,
}) => {
  return (
    <div className="appCard">
      {integration.iconUrl ? (
        <img src={integration.iconUrl} height="100%" width="100%" />
      ) : (
        <div className="defaultAppIcon">
          <Cube color="white" size={18} />
        </div>
      )}
      <div className="appInfo">
        <h4>{integration.name}</h4>
        <p>{integration.description}</p>
      </div>
      {showAddBtn && (
        <div className="quickAdd">
          <IconBtn icon={<Plus />} />
        </div>
      )}
    </div>
  );
};
