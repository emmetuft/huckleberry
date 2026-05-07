import { FC } from 'react';
import styles from './Terms.module.css';

export const Terms: FC = () => {
  return (
    <div className={styles.terms}>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>Terms of service content goes here.</p>
    </div>
  );
};
