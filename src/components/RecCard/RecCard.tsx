import { FC } from 'react';

import styles from './RecCard.module.scss';

interface RecCardProps {}

export const RecCard: FC<RecCardProps> = ({}) => {
  return (
    <div className={styles.RecCard}>
      <h4>You might find this news article interesting</h4>
      <div className={styles.article}>
        <p>Is Artifical General Intelligence the future?</p>
      </div>
    </div>
  );
};
