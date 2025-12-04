import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { useAppDispatch } from 'reducers';
import { Neo4jNode } from 'models/interfaces/ontology';
import { getColorForGroup } from 'utils/styles';
import {
  selectNodeLabels,
  selectHighlightedNodeId,
  selectGraphData,
} from 'reducers/ontology/slice';

interface ForceGraph3DProps {
  onNodeClick?: (node: Neo4jNode) => void;
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

export const ForceGraph: React.FC<ForceGraph3DProps> = ({ onNodeClick }) => {
  const dispatch = useAppDispatch();
  const nodeLabels = useSelector(selectNodeLabels);
  const data = useSelector(selectGraphData);
  const highlightedNodeId = useSelector(selectHighlightedNodeId);

  const graphRef = useRef<any>();

  // Transform Neo4j data to D3 format
  const graphData = useMemo(() => {
    const d3Nodes: D3Node[] = data.nodes.map((node) => {
      return {
        id: node.id,
        name: node.properties.name || node.id,
        labels: node.labels,
        properties: node.properties,
      };
    });

    // Create a Set of valid node IDs for quick lookup
    const nodeIds = new Set(d3Nodes.map((n) => n.id));

    // Filter out relationships that reference non-existent nodes
    const d3Links: D3Link[] = data.relationships
      .filter((rel) => nodeIds.has(rel.source) && nodeIds.has(rel.target))
      .map((rel) => {
        return {
          source: rel.source,
          target: rel.target,
          type: rel.type,
        };
      });

    return {
      nodes: d3Nodes,
      links: d3Links,
    };
  }, [data]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (!highlightedNodeId) return resetCamera();
    highlightNode();
  }, [highlightedNodeId]);

  const highlightNode = () => {
    if (!graphRef.current) return;
    // Zoom to highlighted node
    const node = graphData.nodes.find((n) => n.id === highlightedNodeId);
    if (!node) return;

    graphRef.current.cameraPosition(
      {
        x: node.x!,
        y: node.y!,
        z: node.z! + 250,
      },
      node,
      1500,
    );
  };

  const handleNodeClick = useCallback(
    (node: any, event: MouseEvent) => {
      // Single click - open drawer
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
    graphRef.current.zoomToFit(1500, 50);
  };

  const getNodeColor = useCallback(
    (node: any) => {
      const primaryLabel = node.labels[0] || 'Unknown';
      const labelIndex = nodeLabels.indexOf(primaryLabel);
      const baseColor = getColorForGroup(labelIndex);

      // Highlight the selected node and dim other nodes
      if (highlightedNodeId) {
        if (node.id === highlightedNodeId) return '#ff863aff';
        return `${baseColor}66`;
      }

      return `${baseColor}aa`;
    },
    [highlightedNodeId, nodeLabels],
  );

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={graphData}
      backgroundColor="rgba(0,0,0,0)"
      nodeColor={getNodeColor}
      nodeThreeObjectExtend={true}
      nodeThreeObject={(node: any) => {
        const sprite = new SpriteText(node.name);
        sprite.color = getNodeColor(node);
        sprite.position.y = 8; // Position text above the node
        return sprite;
      }}
      onNodeClick={handleNodeClick}
      linkLabel={(link: any) => link.type}
      linkColor={() => '#000'}
      linkWidth={1}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleSpeed={0.005}
      onEngineStop={handleEngineStop}
    />
  );
};
