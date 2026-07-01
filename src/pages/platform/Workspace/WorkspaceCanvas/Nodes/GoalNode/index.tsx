import { FC, useState } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react';
import { Button, Progress, Tag } from 'antd';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { InputType } from 'models/enums/inputType';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { InputField } from 'components/shared/LabelInput/LabelInput';
import { NodeFormModal } from 'components/shared/NodeFormModal/NodeFormModal';

export enum GoalNodeStatus {
  OnTrack = 'on_track',
  AtRisk = 'at_risk',
  OffTrack = 'off_track',
  Complete = 'complete',
}

export interface GoalNodeData {
  title: string;
  status: GoalNodeStatus;
  description: string;
  targetDate: string;
  progress: number;
  keyResults: { label: string; complete: boolean }[];
}

const STATUS_CONFIG: Record<
  GoalNodeData['status'],
  { label: string; className: string }
> = {
  [GoalNodeStatus.OnTrack]: { label: 'On Track', className: 'infoTag' },
  [GoalNodeStatus.AtRisk]: { label: 'At Risk', className: 'warningTag' },
  [GoalNodeStatus.OffTrack]: { label: 'Off Track', className: 'errorTag' },
  [GoalNodeStatus.Complete]: { label: 'Complete', className: 'successTag' },
};

const FIELDS: InputField[] = [
  { key: 'title', label: 'Goal', inputType: InputType.Text },
  {
    key: 'status',
    label: 'Status',
    inputType: InputType.RadioCards,
    options: [
      { label: 'On Track', value: GoalNodeStatus.OnTrack, selected: true },
      { label: 'At Risk', value: GoalNodeStatus.AtRisk },
      { label: 'Off Track', value: GoalNodeStatus.OffTrack },
    ],
  },
  { key: 'description', label: 'Description', inputType: InputType.TextArea },
  {
    key: 'targetDate',
    label: 'Target date',
    inputType: InputType.Text,
    halfWidth: true,
    inputProps: { placeholder: 'e.g. Sep 30, 2026' },
  },
  {
    key: 'progress',
    label: 'Progress %',
    inputType: InputType.Text,
    halfWidth: true,
    inputProps: { placeholder: '0' },
  },
  {
    key: 'keyResults',
    label: 'Key results',
    inputType: InputType.Tags,
    description: 'Press Enter to add each key result',
  },
];

export const GoalNode: FC<NodeProps<Node<CanvasNode>>> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [showForm, setShowForm] = useState(false);
  const nodeData = data.data as GoalNodeData | undefined;

  const handleConfirm = (vals: Record<string, unknown>) => {
    updateNodeData(id, {
      ...data,
      data: {
        title: String(vals.title ?? ''),
        status: (vals.status as GoalNodeData['status']) ?? 'on_track',
        description: String(vals.description ?? ''),
        targetDate: String(vals.targetDate ?? ''),
        progress: Number(vals.progress ?? 0),
        keyResults: ((vals.keyResults as string[]) ?? []).map((label) => ({
          label,
          complete: false,
        })),
      } satisfies GoalNodeData,
    });
    setShowForm(false);
  };

  const { title, status, description, targetDate, progress, keyResults } =
    nodeData ?? {};
  const { label, className } = status
    ? STATUS_CONFIG[status]
    : { label: '', className: '' };

  return (
    <>
      <NodeWrapper node={data} style={{ width: 300 }}>
        <div className={sharedStyles.container}>
          <div className={styles.header}>
            {nodeData ? (
              <h3 className={styles.title}>{title}</h3>
            ) : (
              <Button
                type="primary"
                size="small"
                onClick={() => setShowForm(true)}
              >
                Define goal
              </Button>
            )}
            {status && <Tag className={className}>{label}</Tag>}
          </div>

          {description && <p className={styles.description}>{description}</p>}

          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressValue}>
                {progress != null ? `${progress}%` : '—'}
              </span>
            </div>
            <Progress
              percent={progress ?? 0}
              showInfo={false}
              strokeColor="var(--node-orange)"
            />
          </div>

          {keyResults && keyResults.length > 0 && (
            <>
              <div className={sharedStyles.divider} />
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
            </>
          )}

          <div className={sharedStyles.divider} />

          <div className={sharedStyles.metadata}>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Target</span>
              <span className={sharedStyles.metaValue}>
                {targetDate ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </NodeWrapper>
      <NodeFormModal
        open={showForm}
        title="Define a goal"
        fields={FIELDS}
        onCancel={() => setShowForm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
