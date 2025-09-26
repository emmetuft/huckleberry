import React, { useState } from 'react';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DATA_ALIAS } from 'constants/mapping';
import { chartColors } from 'constants/styles';
import { useChartData } from 'hooks/useChartData';

interface RecentRunsChartProps {
  height?: number;
}

export const RecentRunsChart: React.FC<RecentRunsChartProps> = ({
  height = 300,
}) => {
  const { data, loading, error } = useChartData<any>({
    alias: DATA_ALIAS.DOMOSTATS_DATASETS_HISTORY,
    schema: ['startTime', 'count'],
    groupBy: ["DATE_TRUNC('day', startTime)"],
    customSelect: "DATE_TRUNC('day', startTime) AS day, COUNT(*) as count",
    orderBy: ['startTime'],
    limit: 7,
  });

  return (
    <>
      <ResponsiveContainer height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="startTime"
            tickFormatter={(value) => dayjs(value).format('M/D/YY')}
          />
          <YAxis domain={[0, 100]} />
          <Bar dataKey="count" fill={chartColors[0]} name="Num runs" />
          <Tooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            labelFormatter={(value) => dayjs(value).format('M/D/YY')}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </BarChart>
      </ResponsiveContainer>
      {loading && (
        <div className="loadingOverlay">
          <Spin />
        </div>
      )}
    </>
  );
};
