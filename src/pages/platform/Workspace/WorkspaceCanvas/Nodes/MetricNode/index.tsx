import { FC, useState } from 'react';
import { NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Button } from 'antd';
import { ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { InputType } from 'models/enums/inputType';
import { InputField } from 'components/shared/LabelInput/LabelInput';
import { NodeFormModal } from 'components/shared/NodeFormModal/NodeFormModal';

export interface MetricNodeData {
  name: string;
  value: string;
  unit: string;
  change: number;
  changeDirection: 'up' | 'down';
  isPositive: boolean;
  period: string;
  lastUpdated: string;
  target?: string;
}

const FIELDS: InputField[] = [
  { key: 'name', label: 'Metric name', inputType: InputType.Text },
  {
    key: 'value',
    label: 'Current value',
    inputType: InputType.Text,
    halfWidth: true,
    inputProps: { placeholder: 'e.g. $2.8M' },
  },
  {
    key: 'unit',
    label: 'Unit',
    inputType: InputType.Text,
    halfWidth: true,
    inputProps: { placeholder: 'e.g. %, k, M' },
  },
  {
    key: 'change',
    label: 'Change %',
    inputType: InputType.Text,
    halfWidth: true,
    inputProps: { placeholder: 'e.g. 12' },
  },
  {
    key: 'changeDirection',
    label: 'Direction',
    inputType: InputType.RadioCards,
    halfWidth: true,
    options: [
      { label: 'Up', value: 'up', selected: true },
      { label: 'Down', value: 'down' },
    ],
  },
  {
    key: 'isPositive',
    label: 'Rising is...',
    inputType: InputType.RadioCards,
    options: [
      { label: 'Good', value: 'true', selected: true },
      { label: 'Bad', value: 'false' },
    ],
  },
  {
    key: 'period',
    label: 'Comparison period',
    inputType: InputType.Text,
    inputProps: { placeholder: 'e.g. last quarter' },
  },
  {
    key: 'target',
    label: 'Target (optional)',
    inputType: InputType.Text,
    inputProps: { placeholder: 'e.g. $3.1M' },
  },
];

export const MetricNode: FC<NodeProps<Node<CanvasNode>>> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [showForm, setShowForm] = useState(false);
  const nodeData = data.data as MetricNodeData | undefined;

  const handleConfirm = (vals: Record<string, unknown>) => {
    updateNodeData(id, {
      ...data,
      data: {
        name: String(vals.name ?? ''),
        value: String(vals.value ?? ''),
        unit: String(vals.unit ?? ''),
        change: Number(vals.change ?? 0),
        changeDirection:
          (vals.changeDirection as MetricNodeData['changeDirection']) ?? 'up',
        isPositive: vals.isPositive === 'true',
        period: String(vals.period ?? ''),
        lastUpdated: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        target: vals.target ? String(vals.target) : undefined,
      } satisfies MetricNodeData,
    });
    setShowForm(false);
  };

  const {
    name,
    value,
    unit,
    change,
    changeDirection,
    isPositive,
    period,
    lastUpdated,
    target,
  } = nodeData ?? {};

  const isGood = changeDirection
    ? (changeDirection === 'up' && !!isPositive) ||
      (changeDirection === 'down' && !isPositive)
    : false;
  const ArrowIcon = changeDirection === 'down' ? ArrowDownIcon : ArrowUpIcon;

  return (
    <>
      <NodeWrapper node={data} style={{ width: 240 }}>
        <div className={sharedStyles.container}>
          {nodeData ? (
            <p className={styles.name}>{name}</p>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => setShowForm(true)}
            >
              Define metric
            </Button>
          )}

          <div className={styles.valueSection}>
            <span className={styles.value}>{value ?? '—'}</span>
            {unit && <span className={styles.unit}>{unit}</span>}
          </div>

          {nodeData && (
            <div
              className={`${styles.change} ${isGood ? styles.positive : styles.negative}`}
            >
              <ArrowIcon size={12} weight="bold" />
              <span>{Math.abs(change ?? 0)}%</span>
              <span className={styles.changePeriod}>vs {period}</span>
            </div>
          )}

          <div className={sharedStyles.divider} />

          <div className={sharedStyles.metadata}>
            {target && (
              <div className={sharedStyles.metaItem}>
                <span className={sharedStyles.metaLabel}>Target</span>
                <span className={sharedStyles.metaValue}>{target}</span>
              </div>
            )}
            <div className={sharedStyles.metaItem}>
              <span className={sharedStyles.metaLabel}>Updated</span>
              <span className={sharedStyles.metaValue}>
                {lastUpdated ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </NodeWrapper>
      <NodeFormModal
        open={showForm}
        title="Define a metric"
        fields={FIELDS}
        onCancel={() => setShowForm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
