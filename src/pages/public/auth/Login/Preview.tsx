import { FC } from 'react';
import { ArrowRightIcon, LightningIcon } from '@phosphor-icons/react';
import styles from './Login.module.css';

export const Preview: FC = () => {
  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <div className={styles.details}>Daren's workspace</div>
        <span>A glimpse</span>
      </div>
      <div>
        <h2>
          Hello, Daren.<span>What would you like to do?</span>
        </h2>
        <div className={styles.chatInput}>
          <LightningIcon weight="fill" color="oklch(0.55 0 0)" />
          <span className={styles.placeholder}>
            Ask anything about your data or your work…
          </span>
          <div className={styles.sendBtn}>
            <ArrowRightIcon />
          </div>
        </div>
      </div>
    </div>
  );
};
