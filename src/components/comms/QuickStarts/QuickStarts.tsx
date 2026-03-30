import { FC } from 'react';
import styles from './QuickStarts.module.css';

export const QuickStarts: FC = () => {
  const options = [
    {
      id: 1,
      content: 'Generate a weekly report',
    },
    {
      id: 2,
      content: 'Explore new JIRA tickets',
    },
    {
      id: 3,
      content: 'Prep for a meeting',
    },
    {
      id: 4,
      content: 'Analyze Confirm data',
    },
  ];

  return (
    <div className={styles.QuickStarts}>
      {options.map((option) => (
        <div key={option.id} className={`${styles.option} card`}>
          {option.content}
        </div>
      ))}
    </div>
  );
};
