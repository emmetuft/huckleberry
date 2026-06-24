import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'utils/misc';

interface Data {
  label: string;
  value: number;
}

interface DonutChartProps {
  distribution: Record<string, number>;
  onClickValue: (val: any) => void;
  width?: number;
  height?: number;
  innerRadiusRatio?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  distribution,
  onClickValue,
  width = 100,
  height = 100,
  innerRadiusRatio = 0.5,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const data = useMemo(() => {
    const sortedEntries = Object.entries(distribution)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const top6 = sortedEntries.slice(0, 6);
    const otherValue = sortedEntries
      .slice(6)
      .reduce((sum, d) => sum + d.value, 0);

    if (otherValue > 0) {
      top6.push({ label: 'Other', value: otherValue });
    }

    return top6;
  }, [distribution]);

  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data],
  );

  const color = useMemo(
    () =>
      d3
        .scaleOrdinal<string>()
        .domain(data.map((d) => d.label))
        .range([
          '#2792c7', // $data-blue-dark
          '#29b5e8', // $data-blue
          '#8a9a9e', // $data-grey-dark
          '#c2ced1', // $data-grey
          '#ff9f37', // $data-orange
          '#d45a8f', // $data-pink
          '#7d44cf', // $data-purple
        ]),
    [data],
  );

  useEffect(() => {
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * innerRadiusRatio;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<Data>().value((d) => d.value);
    const arc = d3
      .arc<d3.PieArcDatum<Data>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Add a single text element for hover percentage
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '14px')
      .style('font-weight', 'bold');

    svg
      .selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.label))
      .attr('stroke', 'var(--background)')
      .style('stroke-width', '2px')
      .style('transition', 'opacity 0.3s ease')
      .on('mouseover', (_event, d) => handleHover(d.data.label))
      .on('mouseout', handleMouseOut)
      .on('click', (_event, d) =>
        onClickValue(isEmpty(d.data.label) ? 'Null' : d.data.label),
      ); // Call onClickValue on section click
  }, [data, width, height, innerRadiusRatio, color, totalValue]);

  const handleHover = (label: string) => {
    setHoveredLabel(label);

    // Highlight corresponding chart section
    d3.select(svgRef.current)
      .selectAll('path')
      .style('opacity', (p: any) => (p.data.label === label ? 1 : 0.3));

    // Show percentage in the middle of the chart
    const hoveredData = data.find((item) => item.label === label);
    if (hoveredData) {
      const percentage = Math.round((hoveredData.value / totalValue) * 100);
      d3.select(svgRef.current)
        .select('text')
        .text(`${percentage}%`)
        .style('fill', color(label));
    }
  };

  const handleMouseOut = () => {
    setHoveredLabel(null);

    // Reset opacity for all chart sections
    d3.select(svgRef.current).selectAll('path').style('opacity', 1);

    // Clear percentage text
    d3.select(svgRef.current).select('text').text('');
  };

  return (
    <>
      <div style={{ alignSelf: 'center', position: 'relative' }}>
        <svg ref={svgRef} />
      </div>

      {/* Data legend */}
      <div style={{ marginTop: '10px' }}>
        {data.map((d, i) => (
          <div
            key={`${d.label}-${i}`}
            className="legend-item"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: color(d.label),
              opacity:
                hoveredLabel === null || hoveredLabel === d.label ? 1 : 0.5,
              cursor: 'pointer',
            }}
            onMouseEnter={() => handleHover(d.label)}
            onMouseLeave={handleMouseOut}
            onClick={() => onClickValue(isEmpty(d.label) ? 'Null' : d.label)}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '85%',
              }}
              title={d.label} // Show full label on hover
            >
              {isEmpty(d.label) ? 'Null' : d.label}
            </span>
            <span>{d.value}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default DonutChart;
