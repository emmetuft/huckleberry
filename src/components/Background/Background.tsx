import { FC } from 'react';

import styles from './Background.module.scss';

interface BackgroundProps {}

export const Background: FC<BackgroundProps> = ({}) => {
  return (
    <>
      <div className={styles.imgBackground}>
        <img src="/static/bg.jpg" />
      </div>
      {/* <div className={styles.Background} /> */}
      <div className={styles.FrostedOverlay} />
    </>
  );
};
