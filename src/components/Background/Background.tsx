import { FC } from 'react';

import styles from './Background.module.scss';

interface BackgroundProps {}

export const Background: FC<BackgroundProps> = ({}) => {
  return (
    <>
      <div className={styles.Background} />
      {/* <div className={styles.FrostedOverlay} /> */}
    </>
  );
};
