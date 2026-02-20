import { FC } from 'react';
import { Position } from '@xyflow/react';
import styles from './index.module.scss';
import { MotionWrapper } from '../MotionWrapper';
import { CustomHandle } from '../../Handle';

export const StartNode: FC = () => {
  // const onChange = useCallback((evt: any) => {
  //   console.log(evt.target.value);
  // }, []);

  return (
    <MotionWrapper className={styles.StartNode}>
      <div>Start</div>
      <CustomHandle id="a" type="source" position={Position.Right} />
    </MotionWrapper>
  );
};
