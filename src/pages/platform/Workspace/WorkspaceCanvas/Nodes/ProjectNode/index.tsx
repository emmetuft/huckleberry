import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface ProjectNodeData {
  name: string;
  status: 'active' | 'paused' | 'complete';
  description: string;
  owner: string;
  startDate: string;
  dueDate: string;
  progress: number;
}

const STATUS_LABELS: Record<ProjectNodeData['status'], string> = {
  active: 'Active',
  paused: 'Paused',
  complete: 'Complete',
};

export const ProjectNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const { name, status, description, owner, startDate, dueDate, progress } =
    data.data as ProjectNodeData;

  return (
    <NodeWrapper node={data} style={{ width: 300 }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.name}>{name}</h3>
          <span className={`${styles.statusBadge} ${styles[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.divider} />

        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Owner</span>
            <span className={styles.metaValue}>{owner}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Start</span>
            <span className={styles.metaValue}>{startDate}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Due</span>
            <span className={styles.metaValue}>{dueDate}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Progress</span>
            <span className={styles.metaValue}>{progress}%</span>
          </div>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </NodeWrapper>
  );
};
