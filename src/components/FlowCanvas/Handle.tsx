import { Handle, Position } from '@xyflow/react';

export const CustomHandle = ({
  id,
  type,
  position,
}: {
  id: string;
  type: 'source' | 'target';
  position: Position;
}) => (
  <Handle
    id={id}
    type={type}
    position={position}
    style={{ background: '#2c2b2a', width: '8px', height: '8px' }}
  />
);
