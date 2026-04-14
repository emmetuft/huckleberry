import { FC } from 'react';
import styles from './Chat.module.css';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';
import { ChatMode } from 'models/enums/chatMode';
import { Triggers } from '../Triggers/Triggers';
import { useSelector } from 'react-redux';
import { selectSessionId } from 'reducers/chat/slice';

interface ChatProps {}

export const Chat: FC<ChatProps> = ({}) => {
  const sessionId = useSelector(selectSessionId);

  return (
    <div className={`${styles.Chat} card`}>
      {!sessionId && <Triggers />}
      <ChatContainer
        chatMode={ChatMode.panel}
        placeholder={"What's the first domino?"}
      />
    </div>
  );
};
