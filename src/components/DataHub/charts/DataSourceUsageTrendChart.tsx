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
  Label,
} from 'recharts';
import { chartColors } from 'constants/styles';
import { useChartData } from 'hooks/useChartData';
import { DATA_ALIAS } from 'constants/mapping';
import dayjs from 'dayjs';
import { sharedTooltipProps } from 'constants/chart';

interface DataSourceUsageTrendChartProps {
  height?: number;
}

export const DataSourceUsageTrendChart: React.FC<
  DataSourceUsageTrendChartProps
> = ({ height = 300 }) => {
  const { data, loading, error } = useChartData<any>({
    alias: DATA_ALIAS.DOMOSTATS_DATASETS_HISTORY,
    schema: ['startTime', 'avgRunTime'],
    groupBy: ["DATE_TRUNC('day', startTime)"],
    customSelect: "DATE_TRUNC('day', startTime), AVG(TIME_TO_SEC(runTime))",
    orderBy: ['startTime'],
    limit: 7,
  });

  return (
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
  );
};
