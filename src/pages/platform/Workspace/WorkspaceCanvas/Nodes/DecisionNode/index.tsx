import { FC, useState } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Button, Tag } from 'antd';
import { CheckCircleIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { InputType } from 'models/enums/inputType';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { InputField } from 'components/shared/LabelInput/LabelInput';
import { NodeFormModal } from 'components/shared/NodeFormModal/NodeFormModal';

export enum DecisionNodeStatus {
  Open = 'open',
  Reviewing = 'reviewing',
  Decided = 'decided',
}

export interface DecisionNodeData {
  title: string;
  status: DecisionNodeStatus;
  description: string;
  options: { label: string; selected?: boolean }[];
  decidedBy?: string;
  decidedAt?: string;
}

const STATUS_CONFIG: Record<
  DecisionNodeData['status'],
  { label: string; className: string }
> = {
  [DecisionNodeStatus.Open]: {
    label: 'Open',
    className: 'defaultTag',
  },
  [DecisionNodeStatus.Reviewing]: { label: 'Reviewing', className: 'infoTag' },
  [DecisionNodeStatus.Decided]: {
    label: 'Decided',
    className: 'successTag',
  },
};

const FIELDS: InputField[] = [
  { key: 'title', label: 'Decision', inputType: InputType.Text },
  {
    key: 'status',
    label: 'Status',
    inputType: InputType.RadioCards,
    options: [
      { label: 'Open', value: 'open', selected: true },
      { label: 'Reviewing', value: 'reviewing' },
      { label: 'Decided', value: 'decided' },
    ],
  },
  { key: 'description', label: 'Description', inputType: InputType.TextArea },
  {
    key: 'options',
    label: 'Options',
    inputType: InputType.Tags,
    description: 'Press Enter to add each option',
  },
  {
    key: 'decidedBy',
    label: 'Decided by',
    inputType: InputType.Text,
    halfWidth: true,
  },
  {
    key: 'decidedAt',
    label: 'Decided on',
    inputType: InputType.Text,
    halfWidth: true,
    inputProps: { placeholder: 'e.g. Jul 1, 2026' },
  },
];

export const DecisionNode: FC<NodeProps<Node<CanvasNode>>> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [showForm, setShowForm] = useState(false);
  const nodeData = data.data as DecisionNodeData | undefined;

  const handleConfirm = (vals: Record<string, unknown>) => {
    updateNodeData(id, {
      ...data,
      data: {
        title: String(vals.title ?? ''),
        status: (vals.status as DecisionNodeData['status']) ?? 'open',
        description: String(vals.description ?? ''),
        options: ((vals.options as string[]) ?? []).map((label) => ({
          label,
          selected: false,
        })),
        decidedBy: vals.decidedBy ? String(vals.decidedBy) : undefined,
        decidedAt: vals.decidedAt ? String(vals.decidedAt) : undefined,
      } satisfies DecisionNodeData,
    });
    setShowForm(false);
  };

  const { title, status, description, options, decidedBy, decidedAt } =
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
                Frame decision
              </Button>
            )}
            {status && <Tag className={className}>{label}</Tag>}
          </div>

          {description && <p className={styles.description}>{description}</p>}

          {options && options.length > 0 && (
            <>
              <div className={sharedStyles.divider} />
              <div className={styles.options}>
                <p className={sharedStyles.sectionLabel}>Options</p>
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
            </>
          )}

          {(decidedBy || decidedAt) && (
            <>
              <div className={sharedStyles.divider} />
              <div className={sharedStyles.metadata}>
                {decidedBy && (
                  <div className={sharedStyles.metaItem}>
                    <span className={sharedStyles.metaLabel}>By</span>
                    <span className={sharedStyles.metaValue}>{decidedBy}</span>
                  </div>
                )}
                {decidedAt && (
                  <div className={sharedStyles.metaItem}>
                    <span className={sharedStyles.metaLabel}>On</span>
                    <span className={sharedStyles.metaValue}>{decidedAt}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </NodeWrapper>
      <NodeFormModal
        open={showForm}
        title="Frame a decision"
        fields={FIELDS}
        onCancel={() => setShowForm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
