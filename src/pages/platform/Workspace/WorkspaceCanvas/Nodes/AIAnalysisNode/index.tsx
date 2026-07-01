import { FC } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Button, Progress, Spin, Tag } from 'antd';
import { SparkleIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { NodeWrapper } from '../NodeWrapper';

export enum AIAnalysisNodeStatus {
  NotStarted = 'not_started',
  Running = 'running',
  Complete = 'complete',
  Failed = 'failed',
}

export interface AIAnalysisNodeData {
  title: string;
  status: AIAnalysisNodeStatus;
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
  [AIAnalysisNodeStatus.NotStarted]: {
    label: 'Not Started',
    className: 'defaultTag',
  },
  [AIAnalysisNodeStatus.Running]: { label: 'Running', className: 'infoTag' },
  [AIAnalysisNodeStatus.Complete]: {
    label: 'Complete',
    className: 'successTag',
  },
  [AIAnalysisNodeStatus.Failed]: { label: 'Failed', className: 'errorTag' },
};

export const AIAnalysisNode: FC<NodeProps<Node<CanvasNode>>> = ({
  id,
  data,
}) => {
  const { updateNodeData } = useReactFlow();
  const nodeData = data.data as AIAnalysisNodeData | undefined;

  const handleRunAnalysis = () => {
    updateNodeData(id, {
      ...data,
      data: {
        title: title ?? 'Analysis',
        status: AIAnalysisNodeStatus.Running,
        summary: '',
        insights: [],
        model: 'claude-sonnet-4-6',
        confidence: 0,
        analyzedAt: '',
      } satisfies AIAnalysisNodeData,
    });
  };

  const {
    title,
    status,
    summary,
    insights,
    model,
    confidence,
    analyzedAt,
    sources,
  } = nodeData ?? {};
  const { label, className } = status
    ? STATUS_CONFIG[status]
    : { label: '', className: '' };

  return (
    <NodeWrapper node={data} style={{ width: 300 }}>
      <div className={sharedStyles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title ?? 'Analysis'}</h3>
          {status && <Tag className={className}>{label}</Tag>}
        </div>

        {status === AIAnalysisNodeStatus.NotStarted ? (
          <Button
            type="primary"
            size="small"
            icon={<SparkleIcon size={14} />}
            onClick={handleRunAnalysis}
          >
            Run analysis
          </Button>
        ) : status === AIAnalysisNodeStatus.Running ? (
          <div className={styles.loadingState}>
            <Spin size="small" />
            <span className={styles.loadingText}>Analyzing...</span>
          </div>
        ) : (
          <>
            {summary && <p className={styles.summary}>{summary}</p>}

            {(confidence ?? 0) > 0 && (
              <div className={styles.confidenceSection}>
                <div className={styles.confidenceHeader}>
                  <span className={styles.confidenceLabel}>Confidence</span>
                  <span className={styles.confidenceValue}>{confidence}%</span>
                </div>
                <Progress
                  percent={confidence}
                  showInfo={false}
                  strokeColor="var(--node-cyan)"
                />
              </div>
            )}

            {insights && insights.length > 0 && (
              <>
                <div className={sharedStyles.divider} />
                <div className={styles.insights}>
                  <p className={sharedStyles.sectionLabel}>Insights</p>
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
              </>
            )}

            {(model || analyzedAt) && (
              <>
                <div className={sharedStyles.divider} />
                <div className={sharedStyles.metadata}>
                  <div className={sharedStyles.metaItem}>
                    <span className={sharedStyles.metaLabel}>Model</span>
                    <span className={sharedStyles.metaValue}>{model}</span>
                  </div>
                  <div className={sharedStyles.metaItem}>
                    <span className={sharedStyles.metaLabel}>On</span>
                    <span className={sharedStyles.metaValue}>{analyzedAt}</span>
                  </div>
                  <div className={sharedStyles.metaItem}>
                    <span className={sharedStyles.metaLabel}>Sources</span>
                    <span className={sharedStyles.metaValue}>{sources}</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </NodeWrapper>
  );
};
