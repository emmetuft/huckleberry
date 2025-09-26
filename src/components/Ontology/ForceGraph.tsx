import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, NodeType } from 'models/interfaces/ontology';
import { nodeColors } from 'constants/styles';

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: NodeType) => void;
}

const ForceGraph: React.FC<ForceGraphProps> = ({
  data,
  width = 1200,
  height = 800,
  onNodeClick,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  // const [tooltip, setTooltip] = useState<{
  //   visible: boolean;
  //   x: number;
  //   y: number;
  //   content: string;
  // }>({ visible: false, x: 0, y: 0, content: '' });

  // const onNodeHover = (node: NodeType | null, event: any) => {
  //   if (node) {
  //     setTooltip({
  //       visible: true,
  //       x: event.pageX,
  //       y: event.pageY,
  //       content: node.id,
  //     });
  //   } else {
  //     setTooltip({ ...tooltip, visible: false });
  //   }
  // };

  useEffect(() => {
    if (!data) return;

    const color = d3
      .scaleOrdinal<string>()
      .domain(new Set(data.nodes.map((d) => d.group.toString())).values())
      .range(nodeColors);
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
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(120),
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });
    // .on('mouseover', (event, d) => {
    //   onNodeHover?.(d, event);
    // })
    // .on('mouseout', () => {
    //   onNodeHover?.(null, null);
    // });

    // Circle inside each group
    node
      .append('circle')
      .attr('r', 30) // larger radius
      .attr('fill', (d) => color((d as NodeType).group.toString()) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Text inside each group
    node
      .append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 700)
      .attr('font-size', 10); // adjust font size as needed

    (addDragBehavior(simulation) as any)(node);

    function ticked() {
      link
        .attr('x1', (d: any) => (d.source as NodeType).x!)
        .attr('y1', (d: any) => (d.source as NodeType).y!)
        .attr('x2', (d: any) => (d.target as NodeType).x!)
        .attr('y2', (d: any) => (d.target as NodeType).y!);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    }

    return () => {
      simulation.stop(); // Stop simulation on unmount
    };
  }, [data, width, height, onNodeClick]);

  return (
    <>
      <svg ref={ref}></svg>
      {/* {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y + 5,
            left: tooltip.x + 10,
            padding: '6px 10px',
            background: '#2c2b2a',
            borderRadius: 4,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            color: 'white',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {tooltip.content}
        </div>
      )} */}
    </>
  );
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
