import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { CheckCircleIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface DecisionNodeData {
  title: string;
  status: 'open' | 'reviewing' | 'decided';
  description: string;
  options: { label: string; selected?: boolean }[];
  decidedBy?: string;
  decidedAt?: string;
}

const STATUS_LABELS: Record<DecisionNodeData['status'], string> = {
  open: 'Open',
  reviewing: 'Reviewing',
  decided: 'Decided',
};

export const DecisionNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const { title, status, description, options, decidedBy, decidedAt } =
    data.data as DecisionNodeData;

  return (
    <NodeWrapper node={data} style={{ width: 300 }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <span className={`${styles.statusBadge} ${styles[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.divider} />

        <div className={styles.options}>
          <p className={styles.sectionLabel}>Options</p>
          {options.map((opt, i) => (
            <div
              key={i}
              className={`${styles.option} ${opt.selected ? styles.selectedOption : ''}`}
            >
              {opt.selected ? (
                <CheckCircleIcon
                  size={13}
                  weight="fill"
                  className={styles.selectedIcon}
                />
              ) : (
                <span className={styles.optionNumber}>{i + 1}</span>
              )}
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>

        {(decidedBy || decidedAt) && (
          <>
            <div className={styles.divider} />
            <div className={styles.footer}>
              {decidedBy && (
                <div className={styles.footerItem}>
                  <span className={styles.footerLabel}>By</span>
                  <span className={styles.footerValue}>{decidedBy}</span>
                </div>
              )}
              {decidedAt && (
                <div className={styles.footerItem}>
                  <span className={styles.footerLabel}>On</span>
                  <span className={styles.footerValue}>{decidedAt}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </NodeWrapper>
  );
};
