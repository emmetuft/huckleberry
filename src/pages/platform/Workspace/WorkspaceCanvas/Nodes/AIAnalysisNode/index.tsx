import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { SparkleIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface AIAnalysisNodeData {
  title: string;
  status: 'running' | 'complete' | 'failed';
  summary: string;
  insights: string[];
  model: string;
  confidence: number;
  analyzedAt: string;
  sources?: number;
}

const STATUS_CONFIG: Record<
  AIAnalysisNodeData['status'],
  { label: string; className: string }
> = {
  running: { label: 'Running', className: 'running' },
  complete: { label: 'Complete', className: 'complete' },
  failed: { label: 'Failed', className: 'failed' },
};

export const AIAnalysisNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const {
    title,
    status,
    summary,
    insights,
    model,
    confidence,
    analyzedAt,
    sources,
  } = data.data as AIAnalysisNodeData;
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

        <p className={styles.summary}>{summary}</p>

        <div className={styles.confidenceSection}>
          <div className={styles.confidenceHeader}>
            <span className={styles.confidenceLabel}>Confidence</span>
            <span className={styles.confidenceValue}>{confidence}%</span>
          </div>
          <div className={styles.confidenceTrack}>
            <div
              className={styles.confidenceBar}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.insights}>
          <p className={styles.sectionLabel}>Insights</p>
          {insights.map((insight, i) => (
            <div key={i} className={styles.insightItem}>
              <SparkleIcon
                size={11}
                weight="fill"
                className={styles.insightIcon}
              />
              <span className={styles.insightText}>{insight}</span>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.footer}>
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Model</span>
            <span className={styles.footerValue}>{model}</span>
          </div>
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>On</span>
            <span className={styles.footerValue}>{analyzedAt}</span>
          </div>
          {sources !== undefined && (
            <div className={styles.footerItem}>
              <span className={styles.footerLabel}>Sources</span>
              <span className={styles.footerValue}>{sources}</span>
            </div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
};
