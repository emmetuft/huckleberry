import { FC } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './ModelCanvas.module.css';
import { MotionWrapper } from 'components/flow/MotionWrapper';

interface ModelNodeProps {
  data: { label: string; isActive: boolean };
}

export const ModelNode: FC<ModelNodeProps> = ({
  data: { label, isActive },
}) => (
  <MotionWrapper
    className={`${styles.ModelNode} ${isActive ? styles.active : ''}`}
  >
    <p title={label}>{label}</p>
    <Handle
      id="circle"
      type="source"
      position={Position.Top}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        transform: 'none',
        opacity: 0,
        background: 'transparent',
        border: 'none',
        cursor: 'crosshair',
      }}
    />
    {/* Sits on top of the Handle in the center area so drags there move the node instead of drawing an edge */}
    <div className={styles.innerDragArea} />
  </MotionWrapper>
);
