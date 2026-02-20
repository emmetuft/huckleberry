import React from 'react';
import { Spin } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { sharedTooltipProps } from 'constants/chart';
import { DATA_ALIAS } from 'constants/mapping';
import { chartColors } from 'constants/styles';
import { useChartData } from 'hooks/useChartData';

interface DataProvidersChartProps {
  height?: number;
}

export const DataProvidersChart: React.FC<DataProvidersChartProps> = ({
  height = 300,
}) => {
  const { data, loading } = useChartData<any>({
    alias: DATA_ALIAS.DOMOSTATS_DATASETS,
    schema: ['dataProvider', 'count'],
    filters: [
      {
        column: 'dataProvider',
        operator: '!=',
        value: '',
      },
    ],
    groupBy: ['dataProvider'],
    customSelect: 'dataProvider, COUNT(*) as count',
    orderBy: ['COUNT(*) DESC'],
    limit: 5,
  });

  return (
    <>
      <ResponsiveContainer height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="dataProvider"
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={70}
            paddingAngle={3}
            label={(entry) => `${entry.count}`}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          <Tooltip {...sharedTooltipProps} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {loading && (
        <div className="loadingOverlay">
          <Spin />
        </div>
      )}
    </>
  );
};
