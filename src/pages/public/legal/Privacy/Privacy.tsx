import { FC } from 'react';
import styles from './Privacy.module.css';

export const Privacy: FC = () => {
  return (
    <div className={styles.Privacy}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>Privacy policy content goes here.</p>
    </div>
  );
};
