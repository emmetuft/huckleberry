import { Handle, Position, useNodeConnections } from '@xyflow/react';

export const CustomHandle = ({
  id,
  type,
  position,
}: {
  id: string;
  type: 'source' | 'target';
  position: Position;
}) => {
  const connections = useNodeConnections({ handleId: id, handleType: type });
  const isConnected = connections.length > 0;

  return (
    <Handle
      id={id}
      type={type}
      position={position}
      className={isConnected ? 'connected' : ''}
      style={{
        background: 'var(--background)',
        border: '1px solid var(--grey-text)',
        width: '10px',
        height: '10px',
      }}
    />
  );
};
