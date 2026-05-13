import { FC } from 'react';
import styles from './Features.module.css';

export const Features: FC = () => {
  return (
    <div className={styles.features}>
      <h1>Features</h1>
      <p>Discover what Huckleberry can do for your business.</p>
    </div>
  );
};
