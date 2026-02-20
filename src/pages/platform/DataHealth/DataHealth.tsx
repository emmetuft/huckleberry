import { FC } from 'react';
import styles from './DataHealth.module.scss';
import Metrics from './Metrics';
import TrendChart from './TrendChart';

interface DataHealthProps {}

export const DataHealth: FC<DataHealthProps> = ({}) => {
  return (
    <div className={styles.DataHealth}>
      <TrendChart />
      <Metrics />
    </div>
  );
};
