import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Popover, Tooltip } from 'antd';
import { ArrowsOutSimple, Chat, X } from 'phosphor-react';
import styles from './PromptBar.module.css';
import { useAppDispatch } from 'reducers';
import {
  clearMessages,
  selectHasMessages,
  setFullScreen,
} from 'reducers/chat/slice';
import { AppPage, platformRoutePaths } from 'models/enums/appPage';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { IntentInput } from 'components/comms/IntentInput/IntentInput';
import { MessageThread } from '../MessageThread/MessageThread';
import { useSelector } from 'react-redux';

interface PromptBarProps {}

export const PromptBar: FC<PromptBarProps> = ({}) => {
  const dispatch = useAppDispatch();
  const hasMessages = useSelector(selectHasMessages);

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const onClickNewChat = () => {
    dispatch(clearMessages());
  };

  const onClickFullScreen = () => {
    dispatch(setFullScreen(true));
    setPopoverOpen(false);
  };

  const popoverContent = (
    <div className={styles.popoverContent}>
      <MessageThread />
      <IntentInput placeholder="What's up?" />
      {hasMessages && (
        <div className={styles.actionBtns}>
          <Tooltip title={'Clear chat'} placement="top" mouseEnterDelay={0.5}>
            <div>
              <IconBtn
                icon={
                  <div className={styles.chatIcons}>
                    <Chat size={20} />
                    <X size={10} className={styles.plusIcon} />
                  </div>
                }
                onClick={onClickNewChat}
              />
            </div>
          </Tooltip>
          <Tooltip
            title={'View in full screen'}
            placement="top"
            mouseEnterDelay={0.5}
          >
            <Link to={platformRoutePaths[AppPage.HOME]}>
              <IconBtn
                icon={<ArrowsOutSimple size={16} />}
                onClick={onClickFullScreen}
              />
            </Link>
          </Tooltip>
        </div>
      )}
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
            width: 600,
            borderRadius: 12,
            boxShadow: 'var(--box-shadow)',
            backgroundColor: 'var(--background)',
          },
        }}
      >
        <div className={styles.bar} />
      </Popover>
    </div>
  );
};
