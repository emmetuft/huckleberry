import { FC, useMemo, useRef, useState, useCallback } from 'react';
import { Edge, Node } from '@xyflow/react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { KnowledgeMetrics } from 'models/interfaces/knowledgeMetrics';
import { computeAllMetrics, NodeWithMetrics } from 'utils/knowledgeMetrics';
import { computeScalarField, ScalarField } from 'utils/topography';
import { Terrain } from './Terrain';
import { GridPlane } from './GridPlane';
import { HillPins } from './HillPins';
import styles from './index.module.css';

const FOG_COLOR = '#ffffff';

interface TooltipState {
  x: number;
  y: number;
  label: string;
  metrics: KnowledgeMetrics;
}

function findNearestNode(
  worldX: number,
  worldZ: number,
  field: ScalarField,
  nodesWithMetrics: NodeWithMetrics[],
): NodeWithMetrics | null {
  const { bounds, nodeTopoPositions } = field;
  if (nodeTopoPositions.length === 0) return null;

  // Convert world XZ to topo-space coordinates (same space as nodeTopoPositions).
  const topoX = worldX + bounds.minX + bounds.width / 2;
  const topoZ = worldZ + bounds.minY + bounds.height / 2;

  let nearestId = '';
  let minDist = Infinity;
  for (const { id, topoX: tx, topoZ: tz } of nodeTopoPositions) {
    const dx = tx - topoX;
    const dz = tz - topoZ;
    const dist = dx * dx + dz * dz;
    if (dist < minDist) {
      minDist = dist;
      nearestId = id;
    }
  }

  return nodesWithMetrics.find((nwm) => nwm.node.id === nearestId) ?? null;
}

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricBar}>
        <div
          className={styles.metricFill}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className={styles.metricValue}>{pct(value)}</span>
    </div>
  );
}

interface SceneProps {
  field: ScalarField;
  onHover: (e: ThreeEvent<PointerEvent>) => void;
  onLeave: () => void;
}

function TerrainScene({ field, onHover, onLeave }: SceneProps) {
  const { bounds } = field;
  const maxBound = Math.max(bounds.width, bounds.height);
  const cameraY = maxBound * 0.7;
  const cameraZ = maxBound * 0.5;
  const fogNear = maxBound * 1.2;
  const fogFar = maxBound * 1.6;

  return (
    <Canvas
      camera={{ position: [0, cameraY, cameraZ], fov: 60, near: 1, far: 20000 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, fogNear, fogFar]} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[200, 400, 200]} intensity={0.3} />
      <GridPlane bounds={bounds} />
      <Terrain field={field} onPointerMove={onHover} onPointerLeave={onLeave} />
      <HillPins field={field} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        maxDistance={maxBound * 1.2}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

interface Props {
  nodes: Node<CanvasNode>[];
  edges: Edge[];
}

export const TopographicScene: FC<Props> = ({ nodes, edges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const nodesWithMetrics = useMemo(
    () => computeAllMetrics(nodes, edges),
    [nodes, edges],
  );

  const field = useMemo(
    () => computeScalarField(nodesWithMetrics, 256),
    [nodesWithMetrics],
  );

  const handleHover = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const nearest = findNearestNode(
        e.point.x,
        e.point.z,
        field,
        nodesWithMetrics,
      );
      if (!nearest || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setTooltip({
        x: e.nativeEvent.clientX - rect.left,
        y: e.nativeEvent.clientY - rect.top,
        label:
          ((nearest.node.data?.data as Record<string, unknown>)
            ?.title as string) ?? nearest.node.id,
        metrics: nearest.metrics,
      });
    },
    [field, nodesWithMetrics],
  );

  const handleLeave = useCallback(() => setTooltip(null), []);

  return (
    <div ref={containerRef} className={styles.scene}>
      <TerrainScene field={field} onHover={handleHover} onLeave={handleLeave} />
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x + 16, top: tooltip.y - 8 }}
        >
          <p className={styles.tooltipTitle}>{tooltip.label}</p>
          <MetricRow
            label="Contribution"
            value={tooltip.metrics.contribution}
          />
          <MetricRow label="Maturity" value={tooltip.metrics.maturity} />
          <MetricRow label="Confidence" value={tooltip.metrics.confidence} />
          <MetricRow label="Consensus" value={tooltip.metrics.consensus} />
          <MetricRow label="Freshness" value={tooltip.metrics.freshness} />
        </div>
      )}
    </div>
  );
};
