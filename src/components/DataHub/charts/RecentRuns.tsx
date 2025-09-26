import React from 'react';
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
  Label,
} from 'recharts';
import { sharedTooltipProps } from 'constants/chart';
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
    customSelect: "DATE_TRUNC('day', startTime), COUNT(*) as count",
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
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }}>
            <Label
              value="Num runs"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle', fontSize: 13 }}
            />
          </YAxis>
          <Bar dataKey="count" fill={chartColors[2]} name="Num runs" />
          <Tooltip
            {...sharedTooltipProps}
            labelFormatter={(value) => dayjs(value).format('M/D/YY')}
          />
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
