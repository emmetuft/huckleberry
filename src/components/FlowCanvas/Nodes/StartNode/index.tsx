import { FC, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

import { CustomHandle } from 'components/FlowCanvas/Handle';
import { MotionWrapper } from '../MotionWrapper';
import styles from './index.module.scss';

export const StartNode: FC = (props) => {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <MotionWrapper className={styles.StartNode}>
      <div>Start</div>
      <CustomHandle id="a" type="source" position={Position.Right} />
    </MotionWrapper>
  );
};
