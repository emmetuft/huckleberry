import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { SimulationNodeDatum } from 'd3';
import { GraphData } from './Ontology';

export interface NodeType extends SimulationNodeDatum {
  id: string;
  group: number;
}

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: NodeType) => void;
}

const ForceGraph: React.FC<ForceGraphProps> = ({
  data,
  width = 928,
  height = 600,
  onNodeClick,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data) return;

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const nodes = data.nodes.map((d) => ({ ...d }));
    const links = data.links.map((d) => ({ ...d }));

    const svg = d3
      .select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('maxWidth', '100%')
      .style('height', 'auto');

    svg.selectAll('*').remove(); // Clear previous renders

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const simulation = d3
      .forceSimulation<NodeType>(nodes as NodeType[])
      .force(
        'link',
        d3.forceLink(links).id((d: any) => d.id),
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d) => color((d as NodeType).group.toString()) as string)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    (addDragBehavior(simulation) as any)(node);

    node.append('title').text((d) => d.id);

    function ticked() {
      link
        .attr('x1', (d: any) => (d.source as NodeType).x!)
        .attr('y1', (d: any) => (d.source as NodeType).y!)
        .attr('x2', (d: any) => (d.target as NodeType).x!)
        .attr('y2', (d: any) => (d.target as NodeType).y!);

      node.attr('cx', (d: any) => d.x!).attr('cy', (d: any) => d.y!);
    }

    function drag(simulation: d3.Simulation<NodeType, undefined>) {
      return d3
        .drag<SVGCircleElement, NodeType>()
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        });
    }

    return () => {
      simulation.stop(); // Stop simulation on unmount
    };
  }, [data, width, height, onNodeClick]);

  return <svg ref={ref}></svg>;
};

function addDragBehavior(simulation: d3.Simulation<NodeType, undefined>) {
  return function (
    selection: d3.Selection<SVGCircleElement, NodeType, SVGGElement, unknown>,
  ) {
    selection.call(
      d3
        .drag<SVGCircleElement, NodeType>()
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }),
    );
  };
}

export default ForceGraph;
