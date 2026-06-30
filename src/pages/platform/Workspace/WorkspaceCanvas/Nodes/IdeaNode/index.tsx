import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface IdeaNodeData {
  title: string;
  status: 'draft' | 'exploring' | 'proposed';
  description: string;
  category: string;
  author: string;
  createdAt: string;
  tags?: string[];
}

const STATUS_LABELS: Record<IdeaNodeData['status'], string> = {
  draft: 'Draft',
  exploring: 'Exploring',
  proposed: 'Proposed',
};

export const IdeaNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const { title, status, description, category, author, createdAt, tags } =
    data.data as IdeaNodeData;

  return (
    <NodeWrapper node={data} style={{ width: 280 }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <span className={`${styles.statusBadge} ${styles[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        <p className={styles.description}>{description}</p>

        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.footer}>
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Category</span>
            <span className={styles.footerValue}>{category}</span>
          </div>
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>By</span>
            <span className={styles.footerValue}>{author}</span>
          </div>
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Date</span>
            <span className={styles.footerValue}>{createdAt}</span>
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
};
