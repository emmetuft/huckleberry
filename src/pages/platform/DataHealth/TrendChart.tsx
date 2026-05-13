import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from 'reducers/app/slice';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from './DataHealth.module.css';

const TrendChart = () => {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  // Generate the same fake data with sine + randomness
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0); // Normalize to midnight
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        value: 50 + Math.sin(i / 2) * 10 + Math.random() * i,
      };
    });
  }, []);

  return (
    <div className={styles.trendChart}>
      <h3>Impact score trend</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              ticks={data.filter((_, i) => i % 2 === 0).map((d) => d.date)}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              width={25}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(1)}
              contentStyle={{
                backgroundColor: isDark ? '#000' : '#fff',
                border: 'none',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                color: isDark ? '#f0f0f0' : '#2a2a2a',
              }}
              labelStyle={{
                fontWeight: 'bold',
                color: isDark ? '#f0f0f0' : '#2a2a2a',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isDark ? '#8673ffff' : '#5a0cff'}
              strokeWidth={2}
              dot={{ r: 3, fill: '#5a0cff' }}
              activeDot={{ r: 6, fill: '#5a0cff' }}
              name="Impact Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
