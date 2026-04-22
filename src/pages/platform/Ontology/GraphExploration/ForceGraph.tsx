import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import SpriteText from 'three-spritetext';
import {
  selectNodeLabels,
  selectHighlightedNodeId,
  selectGraphData,
} from 'reducers/ontology/slice';
import { NODE_LABELS, PEOPLE_SKILLS_GRAPH } from 'constants/graph';
import { GraphData, GraphNode } from 'models/interfaces/ontology';
import { getColorForGroup } from 'utils/styles';

interface ForceGraphProps {
  onNodeClick?: (node: GraphNode) => void;
  mode?: '2d' | '3d';
  data?: GraphData;
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
  onNodeClick,
  mode = '3d',
  data = PEOPLE_SKILLS_GRAPH,
}) => {
  // const nodeLabels = useSelector(selectNodeLabels);
  // const data = useSelector(selectGraphData);
  const nodeLabels = NODE_LABELS;
  const highlightedNodeId = useSelector(selectHighlightedNodeId);

  const graphRef = useRef<any>();

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
    linkDirectionalParticles: 2,
    linkDirectionalParticleWidth: 2,
    linkDirectionalParticleSpeed: 0.005,
    onEngineStop: handleEngineStop,
  };

  if (mode === '2d') {
    return (
      <ForceGraph2D
        {...sharedProps}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(
          node: any,
          ctx: CanvasRenderingContext2D,
          globalScale: number,
        ) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = getNodeColor(node);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(label, node.x, node.y + 6);
        }}
      />
    );
  }

  return (
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
  );
};
