import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from './MessageThread.module.css';
import { selectTurns } from 'reducers/chat/slice';
import { ChatMode } from 'models/enums/chatMode';
import { ConversationTurn } from 'models/interfaces/message';
import { shouldShowTimestamp } from 'utils/datetime';
import { MessageItem } from './MessageItem/MessageItem';

interface MessageThreadProps {
  chatMode: ChatMode;
}

export const MessageThread: FC<MessageThreadProps> = ({ chatMode }) => {
  const turns = useSelector(selectTurns);

  const scrollRef = useRef<HTMLDivElement>(null);
  const turnCountRef = useRef<number>(turns.length);

  useEffect(() => {
    // Auto-scroll to bottom when new turns arrive
    if (scrollRef.current && turns.length > turnCountRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      turnCountRef.current = turns.length;
    }
  }, [turns]);

  if (turns.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.messageThread} ${styles[chatMode]}`}
      ref={scrollRef}
    >
      <div className={styles.messages}>
        {turns.map((turn: ConversationTurn, index: number) => (
          <MessageItem
            key={turn.id}
            turn={turn}
            showTimestamp={shouldShowTimestamp(turn, turns[index - 1])}
          />
        ))}
      </div>
    </div>
  );
};
