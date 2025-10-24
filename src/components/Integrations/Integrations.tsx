import { FC } from 'react';
import styles from './Integrations.module.scss';
import { integrationList } from 'constants/integrations';
import { IntegrationCard } from './IntegrationCard';

interface IntegrationsProps {}

export const Integrations: FC<IntegrationsProps> = () => {
  return (
    <div className={styles.Integrations}>
      <div className={styles.integrationGrid}>
        {integrationList.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
};
