import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styles from './Session.module.css';
import { useAppDispatch } from 'reducers';
import { fetchSession } from 'reducers/chat/actions';
import { selectTurns } from 'reducers/chat/slice';
import { ChatMode } from 'models/enums/chatMode';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';

export const Session: FC = () => {
  const dispatch = useAppDispatch();
  const { sessionId } = useParams<{ sessionId: string }>();
  const turns = useSelector(selectTurns);

  useEffect(() => {
    if (sessionId && turns.length === 0) {
      dispatch(fetchSession(sessionId));
    }
  }, [sessionId]);

  return (
    <div className={styles.session}>
      <ChatContainer
        chatMode={ChatMode.fullScreen}
        placeholder="Ask anything"
      />
    </div>
  );
};
