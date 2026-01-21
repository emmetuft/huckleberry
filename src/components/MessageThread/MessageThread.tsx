import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Markdown from 'react-markdown';
import styles from './MessageThread.module.scss';
import { selectPage } from 'reducers/app/slice';
import { selectFullScreen, selectMessages } from 'reducers/chat/slice';
import { AppPage } from 'models/enums/appPage';
import { Message } from 'models/interfaces/message';
import { ContextGraph } from './ContextGraph';
import { formatMessageTimestamp, shouldShowTimestamp } from 'utils/datetime';

export const MessageThread: FC = () => {
  const messages = useSelector(selectMessages);
  const appPage = useSelector(selectPage);
  const fullScreen = useSelector(selectFullScreen);

  const isFullScreen = appPage === AppPage.HOME && fullScreen;

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
    <div
      className={`${styles.MessageThread} ${isFullScreen ? styles.fullScreen : ''}`}
      ref={scrollRef}
    >
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
              {message.context && (
                <div className={styles.contextGraph}>
                  <ContextGraph
                    context={message.context}
                    minify={!isFullScreen}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
