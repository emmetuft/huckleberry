import { FC } from 'react';
import { Position } from '@xyflow/react';
import styles from './index.module.css';
import { MotionWrapper } from '../MotionWrapper';
import { CustomHandle } from '../../Handle';

export const ActionNode: FC = () => {
  // const onChange = useCallback((evt: any) => {
  //   console.log(evt.target.value);
  // }, []);

  return (
    <MotionWrapper className={styles.ActionNode}>
      <div>Action</div>
      <CustomHandle id="a" type="target" position={Position.Left} />
      <CustomHandle id="b" type="source" position={Position.Right} />
    </MotionWrapper>
  );
};
