import { FC } from 'react';
import { Position } from '@xyflow/react';
import styles from './ModelCanvas.module.css';
import { CustomHandle } from 'components/flow/Handle';
import { MotionWrapper } from 'components/flow/MotionWrapper';

export enum ActionType {
  DATA_TRANSFORMATION = 'Data transformations',
  DATA_VIS = 'Data visualization',
  HUMAN_IN_LOOP = 'Human in the loop',
  MESSAGING = 'Messaging',
}

interface ModelNodeProps {}

export const ModelNode: FC<ModelNodeProps> = () => {
  // const onChange = useCallback((evt: any) => {
  //   console.log(evt.target.value);
  // }, []);

  return (
    <MotionWrapper
      className={`agentNode ${styles.ModelNode}`}
      //   style={{ border: `1px solid ${actionColorMap[actionType]}` }}
    >
      <div className="content">
        <div className="left">
          {/* {actionIconMap[actionType]}
          <p>{actionType}</p> */}
          temp
        </div>
      </div>
      <CustomHandle id="top" type="target" position={Position.Top} />
      <CustomHandle id="left" type="target" position={Position.Left} />
      <CustomHandle id="right" type="source" position={Position.Right} />
      <CustomHandle id="bottom" type="source" position={Position.Bottom} />
    </MotionWrapper>
  );
};
