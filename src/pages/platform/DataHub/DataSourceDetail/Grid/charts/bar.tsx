import { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface BarChartProps {
  distribution: Record<string, number>;
  onClickValue: (val: any) => void;
}

const BarChart: React.FC<BarChartProps> = ({ distribution, onClickValue }) => {
  const chartHeight = 200;

  const svgRef = useRef<SVGSVGElement>(null);
  const [expanded, setExpanded] = useState(false);

  const data = useMemo(() => {
    const sortedEntries = Object.entries(distribution)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return expanded ? sortedEntries : sortedEntries.slice(0, 8);
  }, [distribution, expanded]);

  const totalBars = useMemo(
    () => Object.keys(distribution).length,
    [distribution],
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svgRef.current?.parentElement;
    const width = container?.clientWidth ?? 300;

    const barHeight = 25;
    const height = expanded ? data.length * barHeight : chartHeight;

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, height])
      .padding(0.1);

    const maxBarValue = d3.max(data, (d) => d.value) ?? 0;

    const x = d3
      .scaleLinear()
      .domain([0, maxBarValue]) // Scale based on the maximum value
      .range([0, width]);

    const svgElement = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const chart = svgElement.append('g');

    // Add a group for each row to handle hover interactions
    const rowGroups = chart
      .selectAll('.row-group')
      .data(data)
      .join('g')
      .attr('class', 'row-group')
      .attr('transform', (d) => `translate(0, ${y(d.label) ?? 0})`)
      .on('mouseover', function (_, _d) {
        d3.select(this).select('.bar').attr('fill', 'var(--info-icon)'); // Highlight bar
      })
      .on('mouseout', function () {
        d3.select(this).select('.bar').attr('fill', 'var(--grey-border)'); // Revert bar color
      })
      .style('cursor', 'pointer')
      .on('click', (_, d) => onClickValue(d.label));

    // Add a background rectangle to make the entire row interactive
    rowGroups
      .append('rect')
      .attr('class', 'row-background')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', y.bandwidth())
      .attr('fill', 'transparent');

    // Add bars to the row groups
    rowGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d) => x(d.value)) // Scale bar width proportionally
      .attr('fill', 'var(--grey-border)');

    // Add value names to the row groups
    rowGroups
      .append('text')
      .attr('class', 'label')
      .attr('x', 5)
      .attr('y', y.bandwidth() / 2)
      .attr('dy', '0.35em') // Center text vertically
      .text((d) => d.label)
      .style('fill', 'var(--text)')
      .style('font-size', '10px')
      .each(function (d) {
        const textElement = d3.select(this);
        let truncatedText = d.label;
        textElement.text(truncatedText);

        // Calculate available width for the label
        const availableWidth = width - 30; // Space between bar and count

        // Truncate only if the text overflows
        let textWidth =
          this instanceof SVGTextElement ? this.getBBox().width : 0;
        if (textWidth > availableWidth) {
          while (textWidth > availableWidth && truncatedText.length > 0) {
            truncatedText = truncatedText.slice(0, -1);
            textElement.text(`${truncatedText}...`);
            textWidth =
              this instanceof SVGTextElement ? this.getBBox().width : 0;
          }
        } else {
          textElement.text(d.label);
        }
      });

    // Add counts to the row groups
    rowGroups
      .append('text')
      .attr('class', 'count')
      .attr('x', width - 5)
      .attr('y', y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text((d) => d.value)
      .style('fill', 'var(--grey-text)')
      .style('font-size', '10px');
  }, [data, onClickValue, expanded, chartHeight]);

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          height: chartHeight,
          overflowY: expanded ? 'scroll' : 'hidden', // Always show scrollbar when expanded
        }}
      >
        <svg ref={svgRef} />
      </div>
      {totalBars > 8 && (
        <div
          style={{
            marginTop: '5px',
            textAlign: 'center',
            cursor: 'pointer',
            fontSize: '11px',
            color: 'var(--grey-text)',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : `${totalBars - 8} more`}
        </div>
      )}
    </div>
  );
};

export default BarChart;
