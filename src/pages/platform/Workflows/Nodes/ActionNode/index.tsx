import { FC } from 'react';
import {
  ArrowsSplitIcon,
  ChartDonutIcon,
  IconWeight,
  PersonIcon,
} from '@phosphor-icons/react';
import { Position } from '@xyflow/react';
import styles from './index.module.css';
import { CustomHandle } from 'components/flow/Handle';
import { MotionWrapper } from 'components/flow/MotionWrapper';

export enum ActionType {
  DATA_TRANSFORMATION = 'Data transformations',
  DATA_VIS = 'Data visualization',
  HUMAN_IN_LOOP = 'Human in the loop',
  MESSAGING = 'Messaging',
}

interface ActionNodeProps {
  data: { actionType: ActionType };
}

export const ActionNode: FC<ActionNodeProps> = ({ data: { actionType } }) => {
  // const onChange = useCallback((evt: any) => {
  //   console.log(evt.target.value);
  // }, []);

  const actionColorMap: Record<ActionType, string> = {
    [ActionType.DATA_TRANSFORMATION]: 'var(--node-blue)',
    [ActionType.DATA_VIS]: 'var(--node-purple)',
    [ActionType.HUMAN_IN_LOOP]: 'var(--node-yellow)',
    [ActionType.MESSAGING]: 'var(--node-green)',
  };

  const iconProps = {
    size: 24,
    weight: 'duotone' as IconWeight,
    color: actionColorMap[actionType],
  };

  const actionIconMap: Record<string, any> = {
    [ActionType.DATA_TRANSFORMATION]: (
      <ArrowsSplitIcon {...iconProps} weight="regular" />
    ),
    [ActionType.DATA_VIS]: <ChartDonutIcon {...iconProps} />,
    [ActionType.HUMAN_IN_LOOP]: <PersonIcon {...iconProps} />,
    [ActionType.MESSAGING]: <ArrowsSplitIcon {...iconProps} />,
  };

  return (
    <MotionWrapper
      className={`agentNode ${styles.actionNode}`}
      style={{ border: `1px solid ${actionColorMap[actionType]}` }}
    >
      <div className="content">
        <div className="left">
          {actionIconMap[actionType]}
          <p>{actionType}</p>
        </div>
      </div>
      <CustomHandle id="top" type="target" position={Position.Top} />
      <CustomHandle id="left" type="target" position={Position.Left} />
      <CustomHandle id="right" type="source" position={Position.Right} />
      <CustomHandle id="bottom" type="source" position={Position.Bottom} />
    </MotionWrapper>
  );
};
