import { FC, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

import styles from './index.module.scss';
import { CustomHandle } from 'components/FlowCanvas/Handle';
import { MotionWrapper } from '../MotionWrapper';

export const ActionNode: FC = (props) => {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <MotionWrapper className={styles.ActionNode}>
      <div>Action</div>
      <CustomHandle id="a" type="target" position={Position.Left} />
      <CustomHandle id="b" type="source" position={Position.Right} />
    </MotionWrapper>
  );
};
