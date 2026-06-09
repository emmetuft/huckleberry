import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Session.module.css';
import { useAppDispatch } from 'reducers';
import { fetchSession } from 'reducers/chat/actions';
import { ChatMode } from 'models/enums/chatMode';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';

export const Session: FC = () => {
  const dispatch = useAppDispatch();
  const { sessionId } = useParams<{ sessionId: string }>();

  useEffect(() => {
    if (sessionId) {
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
