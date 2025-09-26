import React, { useState } from 'react';
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
import { chartColors } from 'constants/styles';
import { useChartData } from 'hooks/useChartData';
import { DATA_ALIAS } from 'constants/mapping';

interface RecentRunsChartProps {
  height?: number;
}

export const RecentRunsChart: React.FC<RecentRunsChartProps> = ({
  height = 300,
}) => {
  const { data, loading, error } = useChartData<any>({
    alias: DATA_ALIAS.DOMOSTATS_DATASETS,
    schema: ['lastRunDate', 'count'],
    // filters: [
    //   {
    //     column: 'lastRunDate',
    //     operator: '!=',
    //     value: '',
    //   },
    // ],
    groupBy: ['lastRunDate'],
    customSelect: 'lastRunDate, COUNT(*) as count',
    orderBy: ['COUNT(*) DESC'],
    limit: 5,
  });

  return (
    <ResponsiveContainer height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="lastRunDate" />
        <YAxis domain={[0, 100]} />
        <Bar dataKey="count" fill={chartColors[0]} name="Num runs" />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </BarChart>
    </ResponsiveContainer>
  );
};
