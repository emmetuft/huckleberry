import { FC } from 'react';
import styles from './About.module.css';

export const About: FC = () => {
  return (
    <div className={styles.about}>
      <h1>About Huckleberry</h1>
      <p>Learn more about our mission and team.</p>
    </div>
  );
};
