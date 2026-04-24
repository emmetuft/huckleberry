import { FC } from 'react';
import { ConnectionLineComponentProps, getBezierPath } from '@xyflow/react';

export const ConnectionLine: FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}) => {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="var(--node-blue)"
        strokeWidth={1.5}
        strokeDasharray="5,5"
        d={path}
      />
      <circle cx={toX} cy={toY} r={10} fill="var(--node-blue)" />
      <line
        x1={toX - 5}
        y1={toY}
        x2={toX + 5}
        y2={toY}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={toX}
        y1={toY - 5}
        x2={toX}
        y2={toY + 5}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
};
