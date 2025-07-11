import { FC } from 'react';

import styles from './Ontology.module.scss';
import ForceGraph from './ForceGraph';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  return (
    <div className={styles.Ontology}>
      <ForceGraph />
    </div>
  );
};
