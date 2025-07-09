import { FC, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './index.module.scss';
import { CustomHandle } from 'components/FlowCanvas/Handle';

export const StartNode: FC = (props) => {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className={styles.StartNode}>
      <div>Start</div>
      <CustomHandle id="a" type="source" position={Position.Bottom} />
    </div>
  );
};
