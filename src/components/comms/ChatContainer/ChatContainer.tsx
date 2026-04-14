import { FC } from 'react';
import { ChatMode } from 'models/enums/chatMode';
import { MessageThread } from '../MessageThread/MessageThread';
import { IntentInput } from '../IntentInput/IntentInput';
import styles from './ChatContainer.module.css';

interface ChatContainerProps {
  chatMode: ChatMode;
  placeholder?: string;
  animate?: boolean;
}

export const ChatContainer: FC<ChatContainerProps> = ({
  chatMode,
  placeholder,
  animate,
}) => {
  return (
    <div className={`${styles.ChatContainer} ${styles[chatMode]}`}>
      <MessageThread chatMode={chatMode} />
      <div className={styles.inputArea}>
        <IntentInput placeholder={placeholder} animate={animate} />
      </div>
    </div>
  );
};
