import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { Neo4jNode } from 'models/interfaces/ontology';
import { getColorForGroup } from 'utils/styles';
import { useSelector } from 'react-redux';
import {
  selectNodeLabels,
  selectHighlightedNodeId,
} from 'reducers/ontology/slice';
import { selectFilteredGraphData } from 'reducers/ontology/selectors';

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
}

interface D3Link {
  source: string;
  target: string;
  type: string;
}

export const ForceGraph: React.FC<ForceGraph3DProps> = ({ onNodeClick }) => {
  const nodeLabels = useSelector(selectNodeLabels);
  const data = useSelector(selectFilteredGraphData);
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

    const d3Links: D3Link[] = data.relationships.map((rel) => {
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
    if (node) {
      graphRef.current.cameraPosition(
        {
          x: node.x!,
          y: node.y!,
          z: node.z! + 250,
        },
        node,
        1500,
      );
    }
  };

  const handleNodeClick = (node: any) => {
    // Find the original Neo4j node
    const neo4jNode = data.nodes.find((n) => n.id === node.id);
    if (neo4jNode && onNodeClick) {
      onNodeClick(neo4jNode);
    }
  };

  const handleEngineStop = () => {
    if (!graphRef.current) return;
    resetCamera();
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

      return baseColor;
    },
    [highlightedNodeId],
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
        sprite.textHeight =
          highlightedNodeId && node.id === highlightedNodeId ? 6 : 4;
        sprite.position.y = 8; // Position text above the node
        return sprite;
      }}
      onNodeClick={handleNodeClick}
      nodeLabel={(node: any) => `${node.name} (${node.labels.join(', ')})`}
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
