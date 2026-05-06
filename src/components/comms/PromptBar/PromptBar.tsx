import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Popover, Tooltip } from 'antd';
import { ArrowsOutSimpleIcon, ChatIcon, XIcon } from '@phosphor-icons/react';
import styles from './PromptBar.module.css';
import { useAppDispatch } from 'reducers';
import {
  clearMessages,
  selectHasMessages,
  setFullScreen,
} from 'reducers/chat/slice';
import { AppPage, platformRoutePaths } from 'models/enums/appPage';
import { ChatMode } from 'models/enums/chatMode';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { ChatContainer } from '../ChatContainer/ChatContainer';
import { useIsMobile } from 'hooks/useIsMobile';

interface PromptBarProps {}

export const PromptBar: FC<PromptBarProps> = ({}) => {
  const dispatch = useAppDispatch();
  const hasMessages = useSelector(selectHasMessages);
  const isMobile = useIsMobile();

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
      <ChatContainer chatMode={ChatMode.modal} placeholder="What's up?" />
      {hasMessages && (
        <div className={styles.actionBtns}>
          <Tooltip title={'Clear chat'} placement="top" mouseEnterDelay={0.5}>
            <div>
              <IconBtn
                icon={
                  <div className={styles.chatIcons}>
                    <ChatIcon size={20} />
                    <XIcon size={10} className={styles.plusIcon} />
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
                icon={<ArrowsOutSimpleIcon size={16} />}
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
        trigger={isMobile ? 'click' : 'hover'}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        styles={{
          content: {
            padding: 0,
            width: isMobile ? '80vw' : 600,
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
