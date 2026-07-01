import { FC, useState } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Button, Tag } from 'antd';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { InputField } from 'components/shared/LabelInput/LabelInput';
import { InputType } from 'models/enums/inputType';
import { NodeFormModal } from 'components/shared/NodeFormModal/NodeFormModal';

export enum IdeaNodeStatus {
  Draft = 'draft',
  Exploring = 'exploring',
  Proposed = 'proposed',
}

export interface IdeaNodeData {
  title: string;
  status: IdeaNodeStatus;
  description: string;
  category: string;
  author: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  IdeaNodeData['status'],
  { label: string; className: string }
> = {
  [IdeaNodeStatus.Draft]: { label: 'Draft', className: 'warningTag' },
  [IdeaNodeStatus.Exploring]: { label: 'Exploring', className: 'infoTag' },
  [IdeaNodeStatus.Proposed]: { label: 'Proposed', className: 'defaultTag' },
};

const FIELDS: InputField[] = [
  { key: 'title', label: 'Idea', inputType: InputType.Text },
  {
    key: 'status',
    label: 'Status',
    inputType: InputType.RadioCards,
    options: [
      { label: 'Draft', value: IdeaNodeStatus.Draft, selected: true },
      { label: 'Exploring', value: IdeaNodeStatus.Exploring },
      { label: 'Proposed', value: IdeaNodeStatus.Proposed },
    ],
  },
  { key: 'description', label: 'Description', inputType: InputType.TextArea },
  {
    key: 'category',
    label: 'Category',
    inputType: InputType.Text,
    halfWidth: true,
  },
  {
    key: 'author',
    label: 'Author',
    inputType: InputType.Text,
    halfWidth: true,
  },
];

export const IdeaNode: FC<NodeProps<Node<CanvasNode>>> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [showForm, setShowForm] = useState(false);
  const nodeData = data.data as IdeaNodeData | undefined;

  const handleConfirm = (vals: Record<string, unknown>) => {
    updateNodeData(id, {
      ...data,
      data: {
        title: String(vals.title ?? ''),
        status: (vals.status as IdeaNodeData['status']) ?? IdeaNodeStatus.Draft,
        description: String(vals.description ?? ''),
        category: String(vals.category ?? ''),
        author: String(vals.author ?? ''),
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      } satisfies IdeaNodeData,
    });
    setShowForm(false);
  };

  const { title, status, description, category, author, createdAt } =
    nodeData ?? {};
  const { label, className } = status
    ? STATUS_CONFIG[status]
    : { label: '', className: '' };

  return (
    <>
      <NodeWrapper node={data} style={{ width: 280 }}>
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
                Capture idea
              </Button>
            )}
            {status && <Tag className={className}>{label}</Tag>}
          </div>

          {description && <p className={styles.description}>{description}</p>}

          <div className={sharedStyles.divider} />

          <div className={sharedStyles.metadata}>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Category</span>
              <span className={sharedStyles.metaValue}>{category ?? '—'}</span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>By</span>
              <span className={sharedStyles.metaValue}>{author ?? '—'}</span>
            </div>
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Date</span>
              <span className={sharedStyles.metaValue}>{createdAt ?? '—'}</span>
            </div>
          </div>
        </div>
      </NodeWrapper>
      <NodeFormModal
        open={showForm}
        title="Capture an idea"
        fields={FIELDS}
        onCancel={() => setShowForm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
