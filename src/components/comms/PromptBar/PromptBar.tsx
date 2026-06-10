import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Popover } from 'antd';
import { ArrowsOutSimpleIcon, ChatIcon, XIcon } from '@phosphor-icons/react';
import styles from './PromptBar.module.css';
import { useAppDispatch } from 'reducers';
import {
  clearMessages,
  selectHasMessages,
  selectSessionId,
} from 'reducers/chat/slice';
import { AppPage, platformRoutePaths } from 'models/enums/appPage';
import { ChatMode } from 'models/enums/chatMode';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import AppTooltip from 'components/shared/Tooltip';
import { ChatContainer } from '../ChatContainer/ChatContainer';
import { useIsMobile } from 'hooks/useIsMobile';

interface PromptBarProps {}

export const PromptBar: FC<PromptBarProps> = ({}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sessionId = useSelector(selectSessionId);
  const hasMessages = useSelector(selectHasMessages);
  const isMobile = useIsMobile();

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const onClickNewChat = () => {
    dispatch(clearMessages());
  };

  const onClickFullScreen = () => {
    navigate(`/sessions/${sessionId}`);
    setPopoverOpen(false);
  };

  const popoverContent = (
    <div className={styles.popoverContent}>
      <ChatContainer chatMode={ChatMode.modal} placeholder="What's up?" />
      {hasMessages && (
        <div className={styles.actionBtns}>
          <AppTooltip
            title={'Clear chat'}
            placement="top"
            mouseEnterDelay={0.5}
          >
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
          </AppTooltip>
          <AppTooltip
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
          </AppTooltip>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.promptBar}>
      <Popover
        content={popoverContent}
        placement="top"
        trigger={isMobile ? 'click' : 'hover'}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        styles={{
          content: {
            width: isMobile ? '80vw' : 600,
          },
        }}
      >
        <div className={styles.bar} />
      </Popover>
    </div>
  );
};
