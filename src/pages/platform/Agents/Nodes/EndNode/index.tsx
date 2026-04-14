import { FC } from 'react';
import { Position } from '@xyflow/react';
import { StopIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import { MotionWrapper } from '../MotionWrapper';
import { CustomHandle } from '../../Handle';

export const EndNode: FC = () => {
  // const onChange = useCallback((evt: any) => {
  //   console.log(evt.target.value);
  // }, []);

  return (
    <MotionWrapper className={`agentNode ${styles.EndNode}`}>
      <div className="content">
        <div className="left">
          <StopIcon color="var(--node-red)" weight="duotone" size={24} />
          <p>End</p>
        </div>
      </div>
      <CustomHandle id="b" type="target" position={Position.Left} />
    </MotionWrapper>
  );
};
