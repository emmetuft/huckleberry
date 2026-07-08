import { FC, useState } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Button, Progress, Tag } from 'antd';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { InputType } from 'models/enums/inputType';
import { InputField } from 'components/shared/LabelInput/LabelInput';
import { NodeFormModal } from 'components/shared/NodeFormModal/NodeFormModal';

export enum ProjectNodeStatus {
  Active = 'active',
  Paused = 'paused',
  Complete = 'complete',
}

export interface ProjectNodeData {
  name: string;
  status: ProjectNodeStatus;
  description: string;
  owner: string;
  startDate: string;
  dueDate: string;
  progress: number;
}

const STATUS_CONFIG: Record<
  ProjectNodeData['status'],
  { label: string; className: string }
> = {
  [ProjectNodeStatus.Active]: { label: 'Active', className: 'infoTag' },
  [ProjectNodeStatus.Paused]: { label: 'Paused', className: 'warningTag' },
  [ProjectNodeStatus.Complete]: { label: 'Complete', className: 'successTag' },
};

const FIELDS: InputField[] = [
  { key: 'name', label: 'Project name', inputType: InputType.Text },
  {
    key: 'status',
    label: 'Status',
    inputType: InputType.RadioCards,
    options: [
      { label: 'Active', value: ProjectNodeStatus.Active, selected: true },
      { label: 'Paused', value: ProjectNodeStatus.Paused },
      { label: 'Complete', value: ProjectNodeStatus.Complete },
    ],
  },
  { key: 'description', label: 'Description', inputType: InputType.TextArea },
  { key: 'owner', label: 'Owner', inputType: InputType.Text, halfWidth: true },
  {
    key: 'startDate',
    label: 'Start date',
    inputType: InputType.Text,
    halfWidth: true,
    inputProps: { placeholder: 'e.g. Jul 1, 2026' },
  },
  {
    key: 'dueDate',
    label: 'Due date',
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
];

export const ProjectNode: FC<NodeProps<Node<CanvasNode>>> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [showForm, setShowForm] = useState(false);
  const nodeData = data.data as ProjectNodeData | undefined;

  const handleConfirm = (vals: Record<string, unknown>) => {
    updateNodeData(id, {
      ...data,
      data: {
        name: String(vals.name ?? ''),
        status:
          (vals.status as ProjectNodeData['status']) ??
          ProjectNodeStatus.Active,
        description: String(vals.description ?? ''),
        owner: String(vals.owner ?? ''),
        startDate: String(vals.startDate ?? ''),
        dueDate: String(vals.dueDate ?? ''),
        progress: Number(vals.progress ?? 0),
      } satisfies ProjectNodeData,
    });
    setShowForm(false);
  };

  const { name, status, description, owner, startDate, dueDate, progress } =
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
              <h3 className={styles.name}>{name}</h3>
            ) : (
              <Button
                type="primary"
                size="small"
                onClick={() => setShowForm(true)}
              >
                Add project
              </Button>
            )}
            {status && <Tag className={className}>{label}</Tag>}
          </div>

          {description && <p className={styles.description}>{description}</p>}

          <div className={sharedStyles.divider} />

          <div className={sharedStyles.metadata}>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Owner</span>
              <span className={sharedStyles.metaValue}>{owner ?? '—'}</span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Start</span>
              <span className={sharedStyles.metaValue}>{startDate ?? '—'}</span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Due</span>
              <span className={sharedStyles.metaValue}>{dueDate ?? '—'}</span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Progress</span>
              <span className={sharedStyles.metaValue}>
                {progress != null ? `${progress}%` : '—'}
              </span>
            </div>
          </div>

          <Progress
            percent={progress ?? 0}
            showInfo={false}
            strokeColor="var(--node-green)"
          />
        </div>
      </NodeWrapper>
      <NodeFormModal
        open={showForm}
        title="Add a project"
        fields={FIELDS}
        onCancel={() => setShowForm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
