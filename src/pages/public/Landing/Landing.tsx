import { FC, useMemo, useState } from 'react';
import { Button, Segmented } from 'antd';
import styles from './Landing.module.css';
import UseCasesCarousel from './UseCases/UseCases';
import { Background } from 'components/layouts/PlatformLayout/Background/Background';
import { useIsMobile } from 'hooks/useIsMobile';

export enum UseCase {
  HR = 'HR',
  Finance = 'Finance',
  IT = 'IT',
  Legal = 'Legal',
  Marketing = 'Marketing',
  Manufacturing = 'Manufacturing',
  Operations = 'Operations',
  Retail = 'Retail',
  Sales = 'Sales',
  More = 'More',
}

export const Landing: FC = () => {
  const useCaseOptions = useMemo(() => Object.values(UseCase), []);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const isMobile = useIsMobile();

  return (
    <div className={styles.landing}>
      <Background />
      <h1 className={styles.title}>Huckleberry</h1>
      <p className={styles.subtitle}>
        No matter the team, and no matter the task, Huckleberry elevates you to
        focus on the work that moves your business forward.
      </p>
      <Segmented
        size={isMobile ? 'small' : 'medium'}
        options={isMobile ? useCaseOptions.slice(0, 6) : useCaseOptions}
        value={useCaseOptions[selectedIndex]}
        onChange={(value) =>
          setSelectedIndex(useCaseOptions.indexOf(value as UseCase))
        }
      />
      <UseCasesCarousel
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
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
    </div>
  );
};
