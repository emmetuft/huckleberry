import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from './MessageThread.module.scss';
import { selectPage } from 'reducers/app/slice';
import { selectFullScreen, selectMessages } from 'reducers/chat/slice';
import { AppPage } from 'models/enums/appPage';
import { Message } from 'models/interfaces/message';
import { shouldShowTimestamp } from 'utils/datetime';
import { MessageItem } from './MessageItem';

export const MessageThread: FC = () => {
  const messages = useSelector(selectMessages);
  const appPage = useSelector(selectPage);
  const fullScreen = useSelector(selectFullScreen);

  const isFullScreen = appPage === AppPage.HOME && fullScreen;

  const scrollRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef<number>(messages.length);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current && messages.length > messageCountRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      messageCountRef.current = messages.length;
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.MessageThread} ${isFullScreen ? styles.fullScreen : ''}`}
      ref={scrollRef}
    >
      <div className={styles.messages}>
        {messages.map((message: Message, index: number) => (
          <MessageItem
            key={message.id}
            message={message}
            showTimestamp={shouldShowTimestamp(message, messages[index - 1])}
          />
        ))}
      </div>
    </div>
  );
};
