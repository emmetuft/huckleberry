import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Markdown from 'react-markdown';
import styles from './MessageThread.module.scss';
import { selectMessages } from 'reducers/graphRag/slice';
import { Message } from 'models/interfaces/message';
import { fakeMessages } from 'constants/fakeData';
import { formatMessageTimestamp, shouldShowTimestamp } from 'utils/datetime';

export const MessageThread: FC = () => {
  const messages = useSelector(selectMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={styles.MessageThread} ref={scrollRef}>
      <div className={styles.messages}>
        {messages.map((message: Message, index: number) => (
          <div key={message.id}>
            {shouldShowTimestamp(message, messages[index - 1]) && (
              <div className={styles.timestamp}>
                {formatMessageTimestamp(message.timestamp)}
              </div>
            )}
            <div
              className={`${styles.message} ${
                message.role === 'user' ? styles.user : styles.assistant
              }`}
            >
              <div className={styles.content}>
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
