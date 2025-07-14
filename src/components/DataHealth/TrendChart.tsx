import { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';
import styles from './DataHealth.module.scss';

const TrendChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const data = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        date.setHours(0, 0, 0, 0); // Normalize time to midnight
        return {
          date,
          value: 50 + Math.sin(i / 2) * 10 + Math.random() * i, // Add some variation with sine wave and randomness
        };
      });

      const chart = Plot.plot({
        width: chartRef.current.offsetWidth, // Make chart full width
        height: 300, // Optional: Set a fixed height
        x: {
          type: 'time',
          label: null,
          ticks: 'day',
        },
        y: {
          domain: [0, 100],
          label: null,
          grid: true, // Add grid lines for y-axis
          ticks: 6, // Skip every other value (e.g., 0, 20, 40, 60, 80, 100)
        },
        marks: [
          Plot.line(data, { x: 'date', y: 'value', stroke: '#5a0cff' }),
          Plot.dot(data, {
            x: 'date',
            y: 'value',
            fill: '#5a0cff',
          }),

          // Vertical line (cursor tracking)
          Plot.ruleX(data, Plot.pointerX({ x: 'date', stroke: '#9a7dd8' })),

          // Point on the line where the cursor is hovering
          Plot.dot(
            data,
            Plot.pointerX({
              x: 'date',
              y: 'value',
              r: 4,
              fill: '#5a0cff',
            }),
          ),

          // Text shown on hover
          Plot.text(
            data,
            Plot.pointerX({
              x: 'date',
              y: 'value', // Changed from 'metric' to 'value'
              text: (d) => d.value, // Changed from 'metric' to 'value'
              dy: -15, // Adjust y offset for better spacing
              fontSize: 14,
              stroke: 'white',
              strokeWidth: 5,
              fill: 'black',
              fontWeight: 'bold',
            }),
          ),
        ],
      });

      chartRef.current.appendChild(chart);

      return () => chart.remove();
    }
  }, []);

  return (
    <div className={styles.trendChart}>
      <h3>Impact score trend</h3>
      <div className={styles.chartWrapper} ref={chartRef} />
    </div>
  );
};

export default TrendChart;
