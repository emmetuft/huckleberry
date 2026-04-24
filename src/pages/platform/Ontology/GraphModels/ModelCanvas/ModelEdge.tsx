import { FC } from 'react';
import { BaseEdge, EdgeProps, useReactFlow } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { selectTheme } from 'reducers/app/slice';

const NODE_RADIUS = 45;
const LOOP_SIZE = 50;

const getSelfLoopPath = (
  cx: number,
  cy: number,
  angleDeg: number,
): [string, number, number] => {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const hx = cx + NODE_RADIUS * cos;
  const hy = cy + NODE_RADIUS * sin;

  const c1x = hx + LOOP_SIZE * cos + LOOP_SIZE * sin;
  const c1y = hy + LOOP_SIZE * sin - LOOP_SIZE * cos;
  const c2x = hx + LOOP_SIZE * cos - LOOP_SIZE * sin;
  const c2y = hy + LOOP_SIZE * sin + LOOP_SIZE * cos;

  return [
    `M ${hx},${hy} C ${c1x},${c1y} ${c2x},${c2y} ${hx},${hy}`,
    hx + LOOP_SIZE * 1.3 * cos,
    hy + LOOP_SIZE * 1.3 * sin,
  ];
};

const getFloatingEdgePath = (
  scx: number,
  scy: number,
  tcx: number,
  tcy: number,
): [string, number, number] => {
  const dx = tcx - scx;
  const dy = tcy - scy;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return ['', 0, 0];
  const nx = dx / dist;
  const ny = dy / dist;
  const srcX = scx + nx * NODE_RADIUS;
  const srcY = scy + ny * NODE_RADIUS;
  const tgtX = tcx - nx * NODE_RADIUS;
  const tgtY = tcy - ny * NODE_RADIUS;
  return [
    `M ${srcX},${srcY} L ${tgtX},${tgtY}`,
    (srcX + tgtX) / 2,
    (srcY + tgtY) / 2,
  ];
};

export const ModelEdge: FC<EdgeProps> = ({
  id,
  source,
  target,
  data,
  markerEnd,
  style,
  label,
}) => {
  const { getNode } = useReactFlow();
  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  if (!sourceNode || !targetNode) return null;

  const scx = sourceNode.position.x + NODE_RADIUS;
  const scy = sourceNode.position.y + NODE_RADIUS;

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (source === target) {
    const loopAngle = (data?.loopAngle as number) ?? 315;
    [edgePath, labelX, labelY] = getSelfLoopPath(scx, scy, loopAngle);
  } else {
    const tcx = targetNode.position.x + NODE_RADIUS;
    const tcy = targetNode.position.y + NODE_RADIUS;
    [edgePath, labelX, labelY] = getFloatingEdgePath(scx, scy, tcx, tcy);
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={style}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{
        fontSize: 13,
        fontWeight: 500,
        fill: isDark ? '#fff' : '#000',
      }}
      labelBgStyle={{ fill: isDark ? '#000' : '#fff' }}
    />
  );
};
