import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartColors } from 'constants/styles';

interface DataSourceUsageTrendChartProps {
  height?: number;
}

export const DataSourceUsageTrendChart: React.FC<
  DataSourceUsageTrendChartProps
> = ({ height = 300 }) => {
  const [data] = useState([
    {
      week: 'Week 1',
      queries: 1250,
      dataVolume: 4.2,
      users: 28,
    },
    {
      week: 'Week 2',
      queries: 1580,
      dataVolume: 5.8,
      users: 34,
    },
    {
      week: 'Week 3',
      queries: 1820,
      dataVolume: 7.1,
      users: 41,
    },
    {
      week: 'Week 4',
      queries: 2100,
      dataVolume: 8.9,
      users: 48,
    },
    {
      week: 'Week 5',
      queries: 1950,
      dataVolume: 8.2,
      users: 52,
    },
    {
      week: 'Week 6',
      queries: 2380,
      dataVolume: 10.5,
      users: 58,
    },
  ]);

  return (
    <ResponsiveContainer height={height}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="queries"
          stroke={chartColors[1]}
          strokeWidth={2}
          name="Weekly Queries"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="dataVolume"
          stroke={chartColors[3]}
          strokeWidth={2}
          name="Data Volume (GB)"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="users"
          stroke={chartColors[5]}
          strokeWidth={2}
          name="Active Users"
        />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
