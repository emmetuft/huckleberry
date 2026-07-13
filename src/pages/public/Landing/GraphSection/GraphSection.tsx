import { FC } from 'react';
import { Button } from 'antd';
import styles from './GraphSection.module.css';

export const GraphSection: FC = () => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeading}>
        <h2 className={styles.sectionTitle}>Superior context.</h2>
        <h2 className={styles.sectionTitle}>Powered by graphs.</h2>
      </div>
      <Button shape="round" size="large">
        Watch the demo
      </Button>
      <div className={styles.graphs}>
        <div className={styles.graphContainer}>
          <h2>Ontology graph</h2>
          <h4>The entities and relationships specific to your business</h4>
        </div>
        <div className={styles.graphContainer}>
          <h2>Knowledge graph</h2>
          <h4>
            Metadata that describes how connected sources map to your ontology
          </h4>
        </div>
        <div className={styles.graphContainer}>
          <h2>Entity graph</h2>
          <h4>
            Huckleberry artifacts, including automations, apps, and anything
            else created on the platform
          </h4>
        </div>
        <div className={styles.graphContainer}>
          <h2>Decision graph</h2>
          <h4>
            A record of actions taken and decisions made within your
            organization
          </h4>
        </div>
      </div>
    </div>
  );
};
