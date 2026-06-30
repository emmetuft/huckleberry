import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface GoalNodeData {
  title: string;
  status: 'on_track' | 'at_risk' | 'off_track' | 'complete';
  description: string;
  targetDate: string;
  progress: number;
  keyResults: { label: string; complete: boolean }[];
}

const STATUS_CONFIG: Record<
  GoalNodeData['status'],
  { label: string; className: string }
> = {
  on_track: { label: 'On Track', className: 'onTrack' },
  at_risk: { label: 'At Risk', className: 'atRisk' },
  off_track: { label: 'Off Track', className: 'offTrack' },
  complete: { label: 'Complete', className: 'complete' },
};

export const GoalNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const { title, status, description, targetDate, progress, keyResults } =
    data.data as GoalNodeData;
  const { label, className } = STATUS_CONFIG[status];

  return (
    <NodeWrapper node={data} style={{ width: 300 }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <span className={`${styles.statusBadge} ${styles[className]}`}>
            {label}
          </span>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressValue}>{progress}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.keyResults}>
          <p className={styles.sectionLabel}>Key results</p>
          {keyResults.map((kr, i) => (
            <div key={i} className={styles.krItem}>
              {kr.complete ? (
                <CheckCircleIcon
                  size={14}
                  weight="fill"
                  className={styles.krIconComplete}
                />
              ) : (
                <CircleIcon size={14} className={styles.krIconPending} />
              )}
              <span
                className={`${styles.krLabel} ${kr.complete ? styles.krComplete : ''}`}
              >
                {kr.label}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.footer}>
          <span className={styles.metaLabel}>Target</span>
          <span className={styles.metaValue}>{targetDate}</span>
        </div>
      </div>
    </NodeWrapper>
  );
};
