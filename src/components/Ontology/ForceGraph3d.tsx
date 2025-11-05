import React, { useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { GraphData, Neo4jNode } from 'models/interfaces/ontology';

interface ForceGraph3DProps {
  data: GraphData;
  onNodeClick?: (node: Neo4jNode) => void;
}

interface D3Node {
  id: string;
  name: string;
  group: number;
  labels: string[];
  properties: Record<string, any>;
}

interface D3Link {
  source: string;
  target: string;
  type: string;
}

export const ForceGraph: React.FC<ForceGraph3DProps> = ({
  data,
  onNodeClick,
}) => {
  // Transform Neo4j data to D3 format
  const graphData = useMemo(() => {
    // Create a map to assign group IDs based on node labels
    const labelToGroupMap = new Map<string, number>();
    let groupCounter = 0;

    const d3Nodes: D3Node[] = data.nodes.map((node) => {
      // Use first label as the group identifier
      const primaryLabel = node.labels[0] || 'Unknown';

      if (!labelToGroupMap.has(primaryLabel)) {
        labelToGroupMap.set(primaryLabel, groupCounter++);
      }

      return {
        id: node.id,
        name: node.properties.name || node.id,
        group: labelToGroupMap.get(primaryLabel)!,
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

  const handleNodeClick = (node: any) => {
    // Find the original Neo4j node
    const neo4jNode = data.nodes.find((n) => n.id === node.id);
    if (neo4jNode && onNodeClick) {
      onNodeClick(neo4jNode);
    }
  };

  return (
    <ForceGraph3D
      graphData={graphData}
      backgroundColor="rgba(0,0,0,0)"
      nodeAutoColorBy="group"
      nodeThreeObjectExtend={true}
      nodeThreeObject={(node: any) => {
        const sprite = new SpriteText(node.name);
        sprite.color = node.color || '#5a0cff';
        sprite.textHeight = 4;
        sprite.position.y = 8; // Position text above the node
        return sprite;
      }}
      onNodeClick={handleNodeClick}
      nodeLabel={(node: any) => `${node.name} (${node.labels.join(', ')})`}
      nodeColor={(node: any) => node.color || '#5a0cff'}
      linkLabel={(link: any) => link.type}
      linkColor={() => '#000'}
      linkWidth={1}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleSpeed={0.005}
    />
  );
};
