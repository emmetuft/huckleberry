import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3-force';
import { GraphContext } from '../../../../shared/models/interfaces/userRequest';
import { getColorForGroup } from 'utils/styles';

interface ContextGraphProps {
  context: GraphContext;
  minify?: boolean;
}

interface GraphNode {
  id: string;
  name: string;
  labels: string[];
  properties: Record<string, any>;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export const ContextGraph: FC<ContextGraphProps> = ({ context, minify }) => {
  const graphRef = useRef<any>();

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = context.nodes.map((node) => ({
      id: node.id,
      name: node.properties.name || node.id,
      labels: node.labels,
      properties: node.properties,
    }));

    // Create a Set of valid node IDs for fast lookup
    const nodeIds = new Set(nodes.map((node) => node.id));

    // Filter out relationships that reference non-existent nodes
    const links: GraphLink[] = context.relationships
      .filter((rel) => nodeIds.has(rel.source) && nodeIds.has(rel.target))
      .map((rel) => ({
        source: rel.source,
        target: rel.target,
        type: rel.type,
        properties: rel.properties,
      }));

    return { nodes, links };
  }, [context]);

  const nodeLabels = useMemo(
    () =>
      graphData.nodes
        .flatMap((node) => node.labels)
        .filter((value, index, self) => self.indexOf(value) === index),
    [graphData],
  );

  const getNodeColor = useCallback(
    (node: any) => {
      const primaryLabel = node.labels[0] || 'Unknown';
      const labelIndex = nodeLabels.indexOf(primaryLabel);
      const baseColor = getColorForGroup(labelIndex);
      return `${baseColor}aa`;
    },
    [nodeLabels],
  );

  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;
      // Keep clusters close together
      fg.d3Force('charge', d3.forceManyBody().strength(-10));
    }
  }, [graphData]);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeLabel={(node) => {
        const n = node as GraphNode;
        return `${n.name} (${n.labels.join(', ')})`;
      }}
      nodeColor={getNodeColor}
      linkLabel={(link) => {
        const l = link as GraphLink;
        return l.type;
      }}
      width={minify ? 568 : 680}
      height={300}
      enableZoomInteraction={false}
    />
  );
};
