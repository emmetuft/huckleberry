import { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Session.module.css';
import { useAppDispatch } from 'reducers';
import { fetchSession } from 'reducers/chat/actions';
import { ChatMode } from 'models/enums/chatMode';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';

export const Session: FC = () => {
  const dispatch = useAppDispatch();
  const { sessionId } = useParams<{ sessionId: string }>();
  const prevSessionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (sessionId && sessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = sessionId;
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
