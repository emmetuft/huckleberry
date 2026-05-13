import { FC } from 'react';
import styles from './Chat.module.css';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';
import { ChatMode } from 'models/enums/chatMode';
import { Triggers } from '../Triggers/Triggers';
import { useSelector } from 'react-redux';
import { selectSessionId } from 'reducers/chat/slice';
import { useIsMobile } from 'hooks/useIsMobile';
import { PromptBar } from 'components/comms/PromptBar/PromptBar';

interface ChatProps {}

export const Chat: FC<ChatProps> = ({}) => {
  const sessionId = useSelector(selectSessionId);
  const isMobile = useIsMobile();

  return isMobile ? (
    <PromptBar />
  ) : (
    <div className={`${styles.chat} card`}>
      {!sessionId && <Triggers />}
      <ChatContainer
        chatMode={isMobile ? ChatMode.modal : ChatMode.panel}
        placeholder={"What's the first domino?"}
      />
    </div>
  );
};
