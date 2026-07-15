import { FC } from 'react';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface MetricChartProps {
  visType: 'line' | 'bar';
  data: Array<Record<string, any>>;
  metricName?: string;
  timeColumn?: string;
  minify?: boolean;
}

export const MetricChart: FC<MetricChartProps> = ({
  visType,
  data,
  metricName,
  timeColumn,
  minify,
}) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // Get all column names from the first data point
  const allColumns = Object.keys(data[0]);

  // Determine x-axis: use timeColumn if provided, otherwise first column
  const xAxisKey =
    timeColumn && allColumns.includes(timeColumn) ? timeColumn : allColumns[0];

  // Determine y-axis: use the first column that isn't the x-axis
  const yAxisKey = allColumns.find((col) => col !== xAxisKey) || allColumns[0];

  // Sort data by date (x-axis key)
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a[xAxisKey]);
    const dateB = new Date(b[xAxisKey]);
    return dateA.getTime() - dateB.getTime();
  });

  const chartHeight = minify ? 250 : 350;
  const chartWidth = minify ? 568 : 680;

  const formatXAxisTick = (value: any) => {
    try {
      const date = new Date(value);
      return dayjs(date).format('MMM D, YYYY');
    } catch {
      return value;
    }
  };

  const commonProps = {
    data: sortedData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    width: chartWidth,
    height: chartHeight,
  };

  const sharedComponents = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisKey} tickFormatter={formatXAxisTick} />
      <YAxis />
      <Tooltip labelFormatter={formatXAxisTick} />
    </>
  );

  return (
    <div>
      {metricName && (
        <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>{metricName}</h4>
      )}
      {visType === 'line' ? (
        <LineChart {...commonProps}>
          {sharedComponents}
          <Line
            type="monotone"
            dataKey={yAxisKey}
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      ) : (
        <BarChart {...commonProps}>
          {sharedComponents}
          <Bar dataKey={yAxisKey} fill="#8884d8" />
        </BarChart>
      )}
    </div>
  );
};
