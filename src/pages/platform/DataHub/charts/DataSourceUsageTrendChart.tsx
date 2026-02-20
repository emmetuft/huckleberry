import React from 'react';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { sharedTooltipProps } from 'constants/chart';
import { DATA_ALIAS } from 'constants/mapping';
import { chartColors } from 'constants/styles';
import { useChartData } from 'hooks/useChartData';

interface DataSourceUsageTrendChartProps {
  height?: number;
}

export const DataSourceUsageTrendChart: React.FC<
  DataSourceUsageTrendChartProps
> = ({ height = 300 }) => {
  const { data, loading } = useChartData<any>({
    alias: DATA_ALIAS.DOMOSTATS_DATASETS_HISTORY,
    schema: ['startTime', 'avgRunTime'],
    groupBy: ["DATE_TRUNC('day', startTime)"],
    customSelect: "DATE_TRUNC('day', startTime), AVG(TIME_TO_SEC(runTime))",
    orderBy: ['startTime'],
    limit: 7,
  });

  return (
    <>
      <ResponsiveContainer height={height}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="startTime"
            tickFormatter={(value) => dayjs(value).format('M/D/YY')}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }}>
            <Label
              value="Avg run time (s)"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle', fontSize: 13 }}
            />
          </YAxis>
          <Line
            type="monotone"
            dataKey="avgRunTime"
            stroke={chartColors[5]}
            strokeWidth={2}
            name="Avg run time"
          />
          <Tooltip
            {...sharedTooltipProps}
            labelFormatter={(value) => dayjs(value).format('M/D/YY')}
            formatter={(value) => `${Number(value).toFixed(2)}s`}
          />
        </LineChart>
      </ResponsiveContainer>
      {loading && (
        <div className="loadingOverlay">
          <Spin />
        </div>
      )}
    </>
  );
};
