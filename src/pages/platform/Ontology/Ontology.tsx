import { FC, useState } from 'react';
import { Segmented } from 'antd';
import styles from './Ontology.module.css';
import { GraphExploration } from './GraphExploration/GraphExploration';
import { GraphModels } from './GraphModels/GraphModels';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const [tab, setTab] = useState<string>('graph');

  return (
    <div className={styles.ontology}>
      <Segmented<string>
        className={styles.tabBtn}
        value={tab}
        options={[
          { label: 'Exploration', value: 'graph' },
          { label: 'Models', value: 'models' },
        ]}
        onChange={(value) => setTab(value)}
      />
      {tab === 'graph' && <GraphExploration />}
      {tab === 'models' && <GraphModels />}
    </div>
  );
};
