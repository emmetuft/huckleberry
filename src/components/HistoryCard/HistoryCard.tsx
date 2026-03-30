import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Trash } from 'phosphor-react';
import styles from './HistoryCard.module.css';
import { useAppDispatch } from 'reducers';
import { selectSessions } from 'reducers/chat/slice';
import { PopupCard } from 'components/shared/PopupCard/PopupCard';
import { deleteSession, fetchSession } from 'reducers/chat/actions';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';

interface HistoryCardProps {
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HistoryCard: FC<HistoryCardProps> = ({ setShowCard }) => {
  const dispatch = useAppDispatch();
  const sessions = useSelector(selectSessions);

  const onClickSession = (sessionId: string) => {
    dispatch(fetchSession(sessionId));
  };

  const onClickDeleteSession = (sessionId: string) => {
    dispatch(deleteSession(sessionId));
  };

  return (
    <PopupCard
      title="Past conversations"
      children={
        <div>
          <div className={styles.sectionItems}>
            {sessions.map((session) => (
              <div key={session.id} className={styles.item}>
                <p onClick={() => onClickSession(session.id)}>{session.name}</p>
                <IconBtn
                  icon={<Trash />}
                  onClick={() => onClickDeleteSession(session.id)}
                />
              </div>
            ))}
          </div>
          {sessions.length === 0 && (
            <div className={styles.noHistory}>No past conversations found.</div>
          )}
        </div>
      }
      setShowCard={setShowCard}
    />
  );
};
