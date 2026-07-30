import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import { formatNumber } from 'utils/data';

interface HistogramProps {
  distribution: Record<any, number>;
  dataType: string;
  onClickValue: (val: any) => void;
  width?: number;
  height?: number;
}

const Histogram: React.FC<HistogramProps> = ({
  distribution,
  dataType,
  onClickValue: _onClickValue,
  width = 120,
  height = 100,
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [hoveredRange, setHoveredRange] = useState<{
    range: string;
    count: number;
  } | null>(null);
  const [minVal, setMinVal] = useState<string | null>(null);
  const [maxVal, setMaxVal] = useState<string | null>(null);
  const [rangeVal, setRangeVal] = useState<string | null>(null);
  const [medianVal, setMedianVal] = useState<string | null>(null);

  const maxBars = 20;

  if (
    Object.entries(distribution).filter(([key, _value]) => key !== 'Null')
      .length === 0
  )
    return null;

  useEffect(() => {
    if (chartRef.current) {
      // Clear any existing chart
      chartRef.current.innerHTML = '';

      const entries = Object.entries(distribution)
        .filter(([key, _value]) => key !== 'Null')
        .map(([key, value]) => ({
          key:
            dataType === 'dateString'
              ? new Date(key).getTime()
              : parseFloat(key),
          value,
        }));

      if (entries.length === 0) return;

      const sortedData = entries.sort((a, b) => a.key - b.key);

      let data;
      const min = sortedData[0].key;
      const max = sortedData[sortedData.length - 1].key;
      const rangeSize = (max - min) / maxBars;
      const median =
        sortedData.length % 2 === 0
          ? (sortedData[Math.floor(sortedData.length / 2) - 1].key +
              sortedData[Math.floor(sortedData.length / 2)].key) /
            2
          : sortedData[Math.floor(sortedData.length / 2)].key;

      if (dataType === 'dateString') {
        setMinVal(dayjs(min).format('YYYY-MM-DD'));
        setMaxVal(dayjs(max).format('YYYY-MM-DD'));
        setRangeVal(
          `${dayjs(max).diff(dayjs(min), 'months')} months, ${dayjs(max).diff(dayjs(min), 'days') % 30} days`,
        );
        setMedianVal(dayjs(median).format('YYYY-MM-DD'));
      } else {
        setMinVal(formatNumber(min));
        setMaxVal(formatNumber(max));
        setRangeVal(formatNumber(max - min));
        setMedianVal(formatNumber(median));
      }

      if (max - min > maxBars || sortedData.length > maxBars) {
        data = Array.from({ length: maxBars }, (_, i) => {
          const rangeStart = min + i * rangeSize;
          const rangeEnd = rangeStart + rangeSize;
          const rangeLabel =
            dataType === 'dateString'
              ? `${dayjs(rangeStart).format('YYYY-MM-DD')} to ${dayjs(rangeEnd).format('YYYY-MM-DD')}`
              : `${formatNumber(rangeStart)} to ${formatNumber(rangeEnd)}`;
          const rangeValue = sortedData
            .filter((d) =>
              i === maxBars - 1
                ? d.key >= rangeStart && d.key <= max // Include `max` in the last range
                : d.key >= rangeStart && d.key < rangeEnd,
            )
            .reduce((sum, d) => sum + d.value, 0);

          return { key: rangeLabel, value: rangeValue };
        });
      } else {
        const stepSize = Math.max(
          1,
          Math.ceil(
            (sortedData[sortedData.length - 1].key - sortedData[0].key) /
              maxBars,
          ),
        );

        const allKeys = Array.from(
          {
            length: Math.ceil(
              (sortedData[sortedData.length - 1].key - sortedData[0].key + 1) /
                stepSize,
            ),
          },
          (_, i) => sortedData[0].key + i * stepSize,
        );

        data = allKeys.map((key) => {
          const entry = sortedData.find((d) => d.key === key);
          return {
            key:
              dataType === 'dateString'
                ? dayjs(key).format('YYYY-MM-DD')
                : key.toString(),
            value: entry ? entry.value : 0,
          };
        });
      }

      // Set up SVG dimensions
      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .on('mouseleave', () => setHoveredRange(null)); // Clear hover range when leaving the SVG

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.key))
        .range([0, width])
        .padding(0.3);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) ?? 0])
        .nice()
        .range([height, 0]);

      const chart = svg.append('g');

      // Add bars
      chart
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.key) ?? 0)
        .attr('y', (d) => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - y(d.value))
        .attr('fill', 'var(--grey-border)')
        .on('mouseenter', function (_event, d) {
          d3.select(this).attr('fill', 'var(--info-icon)');
          setHoveredRange({
            range: d.key,
            count: d.value,
          }); // Set the hovered range and count
        })
        .on('mouseleave', function () {
          d3.select(this).attr('fill', 'var(--grey-border)');
        });
    }
  }, [distribution, width, height, dataType]);

  const centerStyle = {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    fontSize: '12px',
    color: 'var(--grey-text)',
  };

  const metricStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as 'wrap',
    fontSize: '12px',
    color: 'var(--grey-text)',
  };

  const valueStyle = {
    fontSize: '12px',
    color: 'var(--text)',
  };

  return (
    <>
      <div
        ref={chartRef}
        style={{ alignSelf: 'center', position: 'relative' }}
      />

      <div style={{ height: '30px' }}>
        {hoveredRange !== null ? (
          <div style={centerStyle}>
            <span
              style={{
                color: 'var(--info-icon)',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              {hoveredRange.range}
            </span>
            <span style={{ ...valueStyle, fontSize: '10px' }}>
              {hoveredRange.count} rows
            </span>
          </div>
        ) : (
          <div style={centerStyle}>
            Median
            <span style={valueStyle}>{medianVal}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <div style={metricStyle}>
          Minimum
          <span style={valueStyle}>{minVal}</span>
        </div>
        <div style={metricStyle}>
          Maximum
          <span style={valueStyle}>{maxVal}</span>
        </div>
        <div style={metricStyle}>
          Range
          <span style={valueStyle}>{rangeVal}</span>
        </div>
      </div>
    </>
  );
};

export default Histogram;
