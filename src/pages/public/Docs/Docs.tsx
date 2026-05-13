import { FC } from 'react';
import styles from './Docs.module.css';

export const Docs: FC = () => {
  return (
    <div className={styles.docs}>
      <h1>Documentation</h1>
      <p>Learn how to use Huckleberry.</p>
    </div>
  );
};
