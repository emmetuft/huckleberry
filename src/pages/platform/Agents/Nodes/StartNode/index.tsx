import { FC } from 'react';
import { Position } from '@xyflow/react';
import { PlayIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import { MotionWrapper } from '../MotionWrapper';
import { CustomHandle } from '../../Handle';

export const StartNode: FC = () => {
  // const onChange = useCallback((evt: any) => {
  //   console.log(evt.target.value);
  // }, []);

  return (
    <MotionWrapper className={`agentNode ${styles.StartNode}`}>
      <div className="content">
        <div className="left">
          <PlayIcon color="var(--node-green)" weight="duotone" size={24} />
          <p>Start</p>
        </div>
      </div>
      <CustomHandle id="a" type="source" position={Position.Right} />
    </MotionWrapper>
  );
};
