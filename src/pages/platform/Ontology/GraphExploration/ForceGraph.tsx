import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import SpriteText from 'three-spritetext';
import {
  selectHighlightedNodeId,
  selectNodeLabels,
} from 'reducers/ontology/slice';
import { GraphData, GraphNode } from 'models/interfaces/ontology';
import { getColorForGroup } from 'utils/styles';

const TOOLTIP_HIDDEN_KEYS = new Set([
  '_version',
  'graphId',
  'customerId',
  'localId',
  'createdAt',
  'updatedAt',
]);

const formatTooltipValue = (key: string, value: any): string => {
  if (key === 'durationMs' && typeof value === 'number') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
  }
  if (
    (key === 'startedAt' || key === 'completedAt') &&
    typeof value === 'number'
  ) {
    return new Date(value).toLocaleTimeString();
  }
  if (typeof value === 'string' && value.length > 80) {
    return value.slice(0, 80) + '…';
  }
  return String(value);
};

const NodeTooltip: React.FC<{ node: D3Node; x: number; y: number }> = ({
  node,
  x,
  y,
}) => {
  const entries = Object.entries(node.properties).filter(
    ([key, val]) => !TOOLTIP_HIDDEN_KEYS.has(key) && val != null,
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x + 12,
        top: y - 10,
        background: 'rgba(20, 20, 28, 0.95)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 6,
        padding: '8px 10px',
        fontSize: 11,
        color: '#e0e0e0',
        pointerEvents: 'none',
        zIndex: 100,
        maxWidth: 300,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>
        {node.labels
          .filter(
            (l) =>
              l !== 'Entity' && l !== 'AISessionEvent' && l !== 'AIContext',
          )
          .join(', ') || 'Node'}
      </div>
      {entries.map(([key, val]) => (
        <div key={key}>
          <span style={{ color: '#888' }}>{key}: </span>
          {formatTooltipValue(key, val)}
        </div>
      ))}
    </div>
  );
};

interface ForceGraphProps {
  data: GraphData;
  mode?: '2d' | '3d';
  onNodeClick?: (node: GraphNode) => void;
}

interface D3Node {
  id: string;
  name: string;
  labels: string[];
  properties: Record<string, any>;
  x?: number;
  y?: number;
  z?: number;
  isSearchResult?: boolean;
}

interface D3Link {
  source: string;
  target: string;
  type: string;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  data,
  mode = '3d',
  onNodeClick,
}) => {
  const nodeLabels = useSelector(selectNodeLabels);
  const highlightedNodeId = useSelector(selectHighlightedNodeId);

  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const d3Nodes: D3Node[] = data.nodes.map((node) => ({
      id: node.id,
      name: node.properties.name || node.id,
      labels: node.labels,
      properties: node.properties,
    }));

    const nodeIds = new Set(d3Nodes.map((n) => n.id));

    const d3Links: D3Link[] = data.edges
      .filter((rel) => nodeIds.has(rel.source) && nodeIds.has(rel.target))
      .map((rel) => ({
        source: rel.source,
        target: rel.target,
        type: rel.type,
      }));

    return { nodes: d3Nodes, links: d3Links };
  }, [data]);

  useEffect(() => {
    if (!graphRef.current || mode !== '2d') return;
    graphRef.current.d3Force('charge')?.strength(-400).distanceMax(500);
    const firstNode = graphData.nodes[0];
    if (firstNode) {
      setTimeout(() => {
        if (!graphRef.current) return;
        const node = graphRef.current
          .graphData()
          .nodes.find((n: any) => n.id === firstNode.id);
        if (node && node.x != null) {
          graphRef.current.centerAt(node.x, node.y, 500);
          graphRef.current.zoom(1.5, 500);
        }
      }, 800);
    }
  }, [graphData, mode]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (!highlightedNodeId) return resetCamera();
    highlightNode();
  }, [highlightedNodeId]);

  const highlightNode = () => {
    if (!graphRef.current) return;
    const node = graphData.nodes.find((n) => n.id === highlightedNodeId);
    if (!node) return;

    if (mode === '3d') {
      // graphRef.current.cameraPosition(
      //   { x: node.x!, y: node.y!, z: node.z! + 250 },
      //   node,
      //   1500,
      // );
    } else {
      graphRef.current.centerAt(node.x, node.y, 1500);
      graphRef.current.zoom(4, 1500);
    }
  };

  const handleNodeClick = useCallback(
    (node: any, event: MouseEvent) => {
      const neo4jNode = data.nodes.find((n) => n.id === node.id);
      if (neo4jNode && onNodeClick) {
        onNodeClick(neo4jNode);
      }
    },
    [data.nodes, onNodeClick],
  );

  const handleEngineStop = () => {
    if (!graphRef.current) return;
    // resetCamera();
  };

  const resetCamera = () => {
    if (!graphRef.current) return;
    // graphRef.current.zoomToFit(1500, 50);
  };

  const getNodeColor = useCallback(
    (node: any) => {
      const primaryLabel = node.labels[0] || 'Unknown';
      const labelIndex = nodeLabels.indexOf(primaryLabel);
      const baseColor = getColorForGroup(labelIndex);

      if (highlightedNodeId) {
        if (node.id === highlightedNodeId) return '#2fcb3fff';
        return `${baseColor}66`;
      }

      return baseColor;
    },
    [highlightedNodeId, nodeLabels],
  );

  const sharedProps = {
    ref: graphRef,
    graphData,
    backgroundColor: 'rgba(0,0,0,0)',
    nodeColor: getNodeColor,
    onNodeClick: handleNodeClick,
    linkLabel: (link: any) => link.type,
    linkColor: () => 'rgba(100, 100, 100, 1)',
    linkWidth: 1,
    linkDirectionalArrowLength: 4,
    linkDirectionalArrowRelPos: 1,
    linkDirectionalParticles: 2,
    linkDirectionalParticleWidth: 2,
    linkDirectionalParticleSpeed: 0.005,
    onEngineStop: handleEngineStop,
    ...(dimensions ?? {}),
  };

  if (mode === '2d') {
    return (
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <ForceGraph2D
          {...sharedProps}
          dagMode="td"
          dagLevelDistance={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          onNodeHover={(node: any) => {
            setHoveredNode(node || null);
          }}
          onBackgroundClick={() => setHoveredNode(null)}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(
            node: any,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const label = node.name;
            const fontSize = 11 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const padding = 2 / globalScale;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
              node.x - textWidth / 2 - padding,
              node.y + 6,
              textWidth + padding * 2,
              fontSize + padding,
            );

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(label, node.x, node.y + 6 + padding / 2);

            if (hoveredNode?.id === node.id && graphRef.current) {
              const coords = graphRef.current.graph2ScreenCoords(
                node.x,
                node.y,
              );
              setTooltipPos({ x: coords.x, y: coords.y });
            }
          }}
        />
        {hoveredNode && (
          <NodeTooltip node={hoveredNode} x={tooltipPos.x} y={tooltipPos.y} />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <ForceGraph3D
        {...sharedProps}
        nodeThreeObjectExtend={true}
        nodeThreeObject={(node: any) => {
          const sprite = new SpriteText(node.name);
          sprite.color = getNodeColor(node);
          sprite.position.y = 8;
          return sprite;
        }}
      />
    </div>
  );
};
