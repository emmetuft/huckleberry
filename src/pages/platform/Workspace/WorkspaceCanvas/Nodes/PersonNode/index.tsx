import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface PersonNodeData {
  name: string;
  role: string;
  department: string;
  email?: string;
  tags?: string[];
  initials: string;
}

export const PersonNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const { name, role, department, email, tags, initials } =
    data.data as PersonNodeData;

  return (
    <NodeWrapper node={data} style={{ width: 260 }}>
      <div className={styles.container}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.identity}>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.role}>{role}</p>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.detail}>
          <span className={styles.detailLabel}>Dept</span>
          <span className={styles.detailValue}>{department}</span>
        </div>
        {email && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{email}</span>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </NodeWrapper>
  );
};
