import { FC, useState } from 'react';
import { Popover } from 'antd';
import styles from './PromptBar.module.scss';
import { IntentInput } from 'components/IntentInput/IntentInput';
import { MessageThread } from './MessageThread';

interface PromptBarProps {}

export const PromptBar: FC<PromptBarProps> = ({}) => {
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const popoverContent = (
    <div className={styles.popoverContent}>
      <MessageThread />
      <IntentInput placeholder="What's up?" />
    </div>
  );

  return (
    <div className={styles.PromptBar}>
      <Popover
        content={popoverContent}
        placement="top"
        trigger="hover"
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        styles={{
          body: {
            padding: 0,
            width: 500,
            borderRadius: 12,
          },
        }}
      >
        <div className={styles.bar} />
      </Popover>
    </div>
  );
};
