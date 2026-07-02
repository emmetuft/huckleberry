import { FC } from 'react';
import { Position } from '@xyflow/react';
import {
  ChartLineUpIcon,
  DatabaseIcon,
  FolderOpenIcon,
  GithubLogoIcon,
  Icon,
  LightbulbIcon,
  ScalesIcon,
  SparkleIcon,
  TargetIcon,
  UserIcon,
} from '@phosphor-icons/react';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { CanvasNodeType } from 'models/enums/nodeType';
import { CustomHandle } from 'components/flow/Handle';
import { MotionWrapper } from 'components/flow/MotionWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

const NODE_TYPE_CONFIG: Record<
  CanvasNodeType,
  { label: string; icon: Icon; color: string }
> = {
  [CanvasNodeType.DATA_SOURCE]: {
    label: 'Data source',
    icon: DatabaseIcon,
    color: 'var(--node-blue)',
  },
  [CanvasNodeType.PERSON]: {
    label: 'Person',
    icon: UserIcon,
    color: 'var(--node-purple)',
  },
  [CanvasNodeType.PROJECT]: {
    label: 'Project',
    icon: FolderOpenIcon,
    color: 'var(--node-green)',
  },
  [CanvasNodeType.GOAL]: {
    label: 'Goal',
    icon: TargetIcon,
    color: 'var(--node-orange)',
  },
  [CanvasNodeType.METRIC]: {
    label: 'Metric',
    icon: ChartLineUpIcon,
    color: 'var(--node-teal)',
  },
  [CanvasNodeType.IDEA]: {
    label: 'Idea',
    icon: LightbulbIcon,
    color: 'var(--node-yellow)',
  },
  [CanvasNodeType.GITHUB_REPO]: {
    label: 'GitHub repo',
    icon: GithubLogoIcon,
    color: 'var(--node-indigo)',
  },
  [CanvasNodeType.DECISION]: {
    label: 'Decision',
    icon: ScalesIcon,
    color: 'var(--node-red)',
  },
  [CanvasNodeType.AI_ANALYSIS]: {
    label: 'AI Analysis',
    icon: SparkleIcon,
    color: 'var(--node-cyan)',
  },
};

export const NodeWrapper: FC<{
  children: React.ReactNode;
  node: CanvasNode;
  style?: React.CSSProperties;
}> = ({ children, node, style }) => {
  const { label, icon: TypeIcon, color } = NODE_TYPE_CONFIG[node.type];

  return (
    <MotionWrapper className={`agentNode ${styles.nodeWrapper}`} style={style}>
      <div className={styles.typeHeader} style={{ color }}>
        <TypeIcon size={12} weight="fill" />
        <span className={styles.typeLabel}>{label}</span>
      </div>
      {!node.data && (
        <>
          {node.hint?.title && (
            <p className={sharedStyles.hintTitle}>{node.hint.title}</p>
          )}
          {node.hint?.description && (
            <p className={sharedStyles.hintDescription}>
              {node.hint.description}
            </p>
          )}
        </>
      )}
      {children}
      <CustomHandle id="top" type="source" position={Position.Top} />
      <CustomHandle id="left" type="source" position={Position.Left} />
      <CustomHandle id="right" type="source" position={Position.Right} />
      <CustomHandle id="bottom" type="source" position={Position.Bottom} />
    </MotionWrapper>
  );
};
