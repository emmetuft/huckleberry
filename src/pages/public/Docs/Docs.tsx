import { FC } from 'react';
import styles from './Docs.module.scss';

export const Docs: FC = () => {
  return (
    <div className={styles.Docs}>
      <h1>Documentation</h1>
      <p>Learn how to use Huckleberry.</p>
    </div>
  );
};
