import { FC } from 'react';
import Metrics from './Metrics';
import TrendChart from './TrendChart';

interface DataHealthProps {}

export const DataHealth: FC<DataHealthProps> = ({}) => {
  return (
    <div className="platformPage">
      <TrendChart />
      <Metrics />
    </div>
  );
};
