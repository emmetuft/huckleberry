import { FC } from 'react';
import { useSelector } from 'react-redux';
import styles from './HistoryCard.module.css';
import { selectSessions } from 'reducers/chat/slice';
import { SessionItem } from 'components/shared/SessionItem/SessionItem';

export const HistoryCard: FC = () => {
  const sessions = useSelector(selectSessions);

  return (
    <div className={styles.historyCard}>
      <div className={styles.sectionItems}>
        <p className={styles.label}>Recents</p>
        {sessions.map((session) => (
          <SessionItem key={session.id} session={session} />
        ))}
      </div>
      {sessions.length === 0 && (
        <div className={styles.noHistory}>No past conversations found.</div>
      )}
    </div>
  );
};
