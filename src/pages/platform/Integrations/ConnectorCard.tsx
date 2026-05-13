import { FC } from 'react';
import { PlusIcon } from '@phosphor-icons/react';
// import styles from './Integrations.module.css';
import { Connector } from 'models/interfaces/connector';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import AppTooltip from 'components/shared/Tooltip';

interface ConnectorCardProps {
  connector: Connector;
  showAddBtn?: boolean;
}

export const ConnectorCard: FC<ConnectorCardProps> = ({
  connector,
  showAddBtn,
}) => {
  return (
    <div className="appCard">
      <img
        src={`/api/connectors/${connector.databaseId}/image`}
        height="100%"
        width="100%"
      />
      <div className="appInfo">
        <h4>{connector.title}</h4>
        <AppTooltip title={connector.description} mouseEnterDelay={1}>
          <p>{connector.description}</p>
        </AppTooltip>
      </div>
      {showAddBtn && (
        <div className="quickAdd">
          <IconBtn icon={<PlusIcon />} />
        </div>
      )}
    </div>
  );
};
