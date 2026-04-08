import { FC } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Trash } from 'phosphor-react';
import styles from './HistoryCard.module.css';
import { useAppDispatch } from 'reducers';
import { selectSessions } from 'reducers/chat/slice';
import { PopupCard } from 'components/shared/PopupCard/PopupCard';
import { deleteSession, fetchSession } from 'reducers/chat/actions';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { AgentSession } from 'models/interfaces/session';

interface HistoryCardProps {
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
}

type SessionGroup = {
  label: string;
  sessions: AgentSession[];
};

function groupSessions(sessions: AgentSession[]): SessionGroup[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups: SessionGroup[] = [
    { label: 'Today', sessions: [] },
    { label: 'Yesterday', sessions: [] },
    { label: 'Last 7 days', sessions: [] },
    { label: 'Last 30 days', sessions: [] },
    { label: 'Older', sessions: [] },
  ];

  for (const session of sessions) {
    const date = new Date(session.lastActivity);
    if (date >= startOfToday) {
      groups[0].sessions.push(session);
    } else if (date >= startOfYesterday) {
      groups[1].sessions.push(session);
    } else if (date >= sevenDaysAgo) {
      groups[2].sessions.push(session);
    } else if (date >= thirtyDaysAgo) {
      groups[3].sessions.push(session);
    } else {
      groups[4].sessions.push(session);
    }
  }

  return groups.filter((g) => g.sessions.length > 0);
}

export const HistoryCard: FC<HistoryCardProps> = ({ setShowCard }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const sessions = useSelector(selectSessions);

  const onClickSession = (sessionId: string) => {
    dispatch(fetchSession(sessionId));
    navigate('/workspace');
    setShowCard(false);
  };

  const onClickDeleteSession = (sessionId: string) => {
    dispatch(deleteSession(sessionId));
  };

  const groups = groupSessions(sessions);

  return (
    <PopupCard
      title="Session history"
      children={
        <div>
          <div className={styles.sectionItems}>
            {groups.map((group) => (
              <div key={group.label}>
                <p className={styles.groupLabel}>{group.label}</p>
                {group.sessions.map((session) => (
                  <div key={session.id} className={styles.item}>
                    <p onClick={() => onClickSession(session.id)}>
                      {session.name}
                    </p>
                    <IconBtn
                      icon={<Trash />}
                      onClick={() => onClickDeleteSession(session.id)}
                    />
                  </div>
                ))}
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
