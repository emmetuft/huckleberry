import { FC, useCallback } from 'react';
import { Position } from '@xyflow/react';

import styles from './index.module.scss';
import { CustomHandle } from 'components/Workflows/Handle';
import { MotionWrapper } from '../MotionWrapper';

export const EndNode: FC = (props) => {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <MotionWrapper className={styles.EndNode}>
      <div>End</div>
      <CustomHandle id="b" type="target" position={Position.Left} />
    </MotionWrapper>
  );
};
