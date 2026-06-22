import { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Session.module.css';
import { useAppDispatch } from 'reducers';
import { fetchSession } from 'reducers/chat/actions';
import { selectSessionId } from 'reducers/chat/slice';
import { ChatMode } from 'models/enums/chatMode';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';

export const Session: FC = () => {
  const dispatch = useAppDispatch();
  const { sessionId } = useParams<{ sessionId: string }>();
  const prevSessionIdRef = useRef<string | undefined>(undefined);
  const chatSessionId = useSelector(selectSessionId);
  const chatSessionIdRef = useRef(chatSessionId);
  chatSessionIdRef.current = chatSessionId;

  useEffect(() => {
    if (sessionId && sessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = sessionId;
      if (sessionId !== chatSessionIdRef.current) {
        dispatch(fetchSession(sessionId));
      }
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
