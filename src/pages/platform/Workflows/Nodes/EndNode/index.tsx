import { FC } from 'react';
import { Position } from '@xyflow/react';
import styles from './index.module.css';
import { MotionWrapper } from '../MotionWrapper';
import { CustomHandle } from '../../Handle';

export const EndNode: FC = () => {
  // const onChange = useCallback((evt: any) => {
  //   console.log(evt.target.value);
  // }, []);

  return (
    <MotionWrapper className={styles.EndNode}>
      <div>End</div>
      <CustomHandle id="b" type="target" position={Position.Left} />
    </MotionWrapper>
  );
};
