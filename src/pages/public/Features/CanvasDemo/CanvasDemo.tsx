import { FC, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CANVAS_NODES, CANVAS_EDGES } from '../mockData';
import styles from './CanvasDemo.module.css';

const NODE_W = 150;
const NODE_H = 46;

export const CanvasDemo: FC = () => {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const nodeDelay = (i: number) => i * 0.2;
  const edgeDelay = CANVAS_NODES.length * 0.2 + 0.15;
  const aiNodeIdx = CANVAS_NODES.findIndex((n) => n.id === 'ai');

  return (
    <div className={styles.container}>
      <svg
        ref={ref}
        viewBox="0 0 515 185"
        className={styles.svg}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="featDotGrid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="0.8" fill="#444" />
          </pattern>
          <filter id="aiGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="515" height="185" fill="#141414" rx="12" />
        <rect width="515" height="185" fill="url(#featDotGrid)" rx="12" />

        {/* Edges — render before nodes so nodes sit on top */}
        {CANVAS_EDGES.map((edge, i) => {
          const from = CANVAS_NODES.find((n) => n.id === edge.from)!;
          const to = CANVAS_NODES.find((n) => n.id === edge.to)!;
          const x1 = from.x + NODE_W / 2;
          const y1 = from.y + NODE_H / 2;
          const x2 = to.x + NODE_W / 2;
          const y2 = to.y + NODE_H / 2;
          const d = `M ${x1} ${y1} L ${x2} ${y2}`;

          return (
            <motion.path
              key={edge.id}
              d={d}
              stroke="#444"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                inView
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                duration: 0.5,
                delay: edgeDelay + i * 0.18,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Nodes */}
        {CANVAS_NODES.map((node, i) => {
          const isAi = node.id === 'ai';
          return (
            <motion.g
              key={node.id}
              style={{
                transformOrigin: `${node.x + NODE_W / 2}px ${node.y + NODE_H / 2}px`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
              }
              transition={{
                duration: 0.35,
                delay: nodeDelay(i === aiNodeIdx ? aiNodeIdx : i),
                type: 'spring',
                stiffness: 280,
                damping: 22,
              }}
            >
              {isAi && inView && (
                <motion.rect
                  x={node.x - 4}
                  y={node.y - 4}
                  width={NODE_W + 8}
                  height={NODE_H + 8}
                  rx={11}
                  fill="none"
                  stroke={node.accentColor}
                  strokeWidth={1.5}
                  filter="url(#aiGlow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.7, 0.3, 0.7] }}
                  transition={{
                    delay: edgeDelay + CANVAS_EDGES.length * 0.18 + 0.4,
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              <rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill="#222"
                stroke="#333"
              />
              <rect
                x={node.x}
                y={node.y}
                width={4}
                height={NODE_H}
                rx={2}
                fill={node.accentColor}
              />
              <text
                x={node.x + 13}
                y={node.y + 15}
                fontSize={8}
                fill="#777"
                fontFamily="Inter, sans-serif"
              >
                {node.sublabel}
              </text>
              <text
                x={node.x + 13}
                y={node.y + 31}
                fontSize={11}
                fill="#e8e8e8"
                fontWeight={500}
                fontFamily="Inter, sans-serif"
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};
