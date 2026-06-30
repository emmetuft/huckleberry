import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface MetricNodeData {
  name: string;
  value: string;
  unit: string;
  change: number;
  changeDirection: 'up' | 'down';
  isPositive: boolean;
  period: string;
  lastUpdated: string;
  target?: string;
}

export const MetricNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const {
    name,
    value,
    unit,
    change,
    changeDirection,
    isPositive,
    period,
    lastUpdated,
    target,
  } = data.data as MetricNodeData;

  const isGood =
    (changeDirection === 'up' && isPositive) ||
    (changeDirection === 'down' && !isPositive);
  const ArrowIcon = changeDirection === 'up' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <NodeWrapper node={data} style={{ width: 240 }}>
      <div className={styles.container}>
        <p className={styles.name}>{name}</p>

        <div className={styles.valueSection}>
          <span className={styles.value}>{value}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>

        <div
          className={`${styles.change} ${isGood ? styles.positive : styles.negative}`}
        >
          <ArrowIcon size={12} weight="bold" />
          <span>{Math.abs(change)}%</span>
          <span className={styles.changePeriod}>vs {period}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.footer}>
          {target && (
            <div className={styles.footerItem}>
              <span className={styles.footerLabel}>Target</span>
              <span className={styles.footerValue}>{target}</span>
            </div>
          )}
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Updated</span>
            <span className={styles.footerValue}>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
};
