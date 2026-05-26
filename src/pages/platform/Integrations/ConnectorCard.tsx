import { FC } from 'react';
import styles from './Integrations.module.css';
import { Connector } from 'models/interfaces/connector';

interface ConnectorCardProps {
  connector: Connector;
}

export const ConnectorCard: FC<ConnectorCardProps> = ({ connector }) => {
  return (
    <div className={styles.connector}>
      <div className={styles.heading}>
        <img
          className={styles.logo}
          src={`/api/connectors/${connector.databaseId}/image`}
          height="100%"
          width="100%"
        />
      </div>
      <h4>{connector.title}</h4>
      <p>{connector.description}</p>
      <div className={styles.viewBtn}>View</div>
    </div>
  );
};
