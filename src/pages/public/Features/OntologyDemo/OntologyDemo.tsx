import { FC, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { OntologyNodeData, ONTOLOGY_NODES, ONTOLOGY_EDGES } from '../mockData';
import styles from './OntologyDemo.module.css';

const getEdgePoints = (from: OntologyNodeData, to: OntologyNodeData) => {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: from.cx + from.r * ux,
    y1: from.cy + from.r * uy,
    x2: to.cx - to.r * ux,
    y2: to.cy - to.r * uy,
    // midpoint offset perpendicular to edge so label doesn't sit on the line
    lx: (from.cx + to.cx) / 2 - uy * 9,
    ly: (from.cy + to.cy) / 2 + ux * 9,
  };
};

export const OntologyDemo: FC = () => {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const centerNode = ONTOLOGY_NODES[0];
  const radialNodes = ONTOLOGY_NODES.slice(1);
  const edgeDelay = 0.2 + radialNodes.length * 0.15 + 0.2;

  return (
    <div className={styles.container}>
      <svg
        ref={ref}
        viewBox="0 0 400 290"
        className={styles.svg}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="ontoDotGrid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="0.8" fill="#444" />
          </pattern>
        </defs>

        <rect width="400" height="290" fill="#141414" rx="12" />
        <rect width="400" height="290" fill="url(#ontoDotGrid)" rx="12" />

        {/* Edges — behind nodes */}
        {ONTOLOGY_EDGES.map((edge, i) => {
          const from = ONTOLOGY_NODES.find((n) => n.id === edge.from)!;
          const to = ONTOLOGY_NODES.find((n) => n.id === edge.to)!;
          const { x1, y1, x2, y2 } = getEdgePoints(from, to);

          return (
            <motion.line
              key={edge.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={to.color}
              strokeWidth={1}
              strokeOpacity={0.45}
              strokeDasharray="4 3"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={
                inView
                  ? { opacity: 1, pathLength: 1 }
                  : { opacity: 0, pathLength: 0 }
              }
              transition={{
                duration: 0.4,
                delay: edgeDelay + i * 0.1,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Edge relationship labels — offset perpendicular to edge */}
        {ONTOLOGY_EDGES.map((edge, i) => {
          const from = ONTOLOGY_NODES.find((n) => n.id === edge.from)!;
          const to = ONTOLOGY_NODES.find((n) => n.id === edge.to)!;
          const { lx, ly } = getEdgePoints(from, to);

          return (
            <motion.text
              key={`label-${edge.id}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fill={to.color}
              fillOpacity={0.65}
              fontFamily="Inter, sans-serif"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, delay: edgeDelay + i * 0.1 + 0.3 }}
            >
              {edge.label}
            </motion.text>
          );
        })}

        {/* Radial nodes */}
        {radialNodes.map((node, i) => (
          <motion.g
            key={node.id}
            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
            }
            transition={{
              duration: 0.3,
              delay: 0.2 + i * 0.15,
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill={node.color}
              fillOpacity={0.12}
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="none"
              stroke={node.color}
              strokeWidth={1.5}
            />
            <text
              x={node.cx}
              y={node.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill={node.color}
              fontWeight={600}
              fontFamily="Inter, sans-serif"
            >
              {node.label.includes(' ') ? (
                <>
                  <tspan x={node.cx} dy="-5">
                    {node.label.split(' ')[0]}
                  </tspan>
                  <tspan x={node.cx} dy="12">
                    {node.label.split(' ').slice(1).join(' ')}
                  </tspan>
                </>
              ) : (
                node.label
              )}
            </text>
          </motion.g>
        ))}

        {/* Center node — appears first */}
        <motion.g
          style={{ transformOrigin: `${centerNode.cx}px ${centerNode.cy}px` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{
            duration: 0.4,
            delay: 0,
            type: 'spring',
            stiffness: 240,
            damping: 18,
          }}
        >
          <circle
            cx={centerNode.cx}
            cy={centerNode.cy}
            r={centerNode.r}
            fill={centerNode.color}
            fillOpacity={0.18}
          />
          <circle
            cx={centerNode.cx}
            cy={centerNode.cy}
            r={centerNode.r}
            fill="none"
            stroke={centerNode.color}
            strokeWidth={2}
          />
          <text
            x={centerNode.cx}
            y={centerNode.cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill={centerNode.color}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
          >
            {centerNode.label}
          </text>
        </motion.g>
      </svg>
    </div>
  );
};
