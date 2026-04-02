import { FC } from 'react';
import { Cube, Plus } from 'phosphor-react';
import { Tooltip } from 'antd';
// import styles from './Integrations.module.css';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { Connector } from 'models/interfaces/connector';

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
      {/* <div className="defaultAppIcon">
        <Cube color="white" size={18} />
      </div> */}
      <div className="appInfo">
        <h4>{connector.title}</h4>
        <Tooltip title={connector.description} mouseEnterDelay={1}>
          <p>{connector.description}</p>
        </Tooltip>
      </div>
      {showAddBtn && (
        <div className="quickAdd">
          <IconBtn icon={<Plus />} />
        </div>
      )}
    </div>
  );
};
