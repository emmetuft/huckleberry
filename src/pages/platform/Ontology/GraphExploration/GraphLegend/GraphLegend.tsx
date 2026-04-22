import React from 'react';
import { getColorForGroup } from 'utils/styles';
import styles from './GraphLegend.module.css';

interface GraphLegendProps {
  labels: string[];
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ labels }) => {
  if (!labels.length) return null;

  return (
    <div className={`${styles.GraphLegend} card`}>
      {labels.map((label, index) => (
        <div key={label} className={styles.item}>
          <span
            className={styles.dot}
            style={{ backgroundColor: getColorForGroup(index) }}
          />
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
};
