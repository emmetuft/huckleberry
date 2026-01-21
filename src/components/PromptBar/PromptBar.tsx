import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { routePaths } from 'routes';
import { Popover } from 'antd';
import { ArrowsOutSimple } from 'phosphor-react';
import styles from './PromptBar.module.scss';
import { useAppDispatch } from 'reducers';
import { setFullScreen } from 'reducers/chat/slice';
import { AppPage } from 'models/enums/appPage';
import { IconBtn } from 'components/IconBtn/IconBtn';
import { IntentInput } from 'components/IntentInput/IntentInput';
import { MessageThread } from '../MessageThread/MessageThread';

interface PromptBarProps {}

export const PromptBar: FC<PromptBarProps> = ({}) => {
  const dispatch = useAppDispatch();

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const onClickFullScreen = () => {
    dispatch(setFullScreen(true));
    setPopoverOpen(false);
  };

  const popoverContent = (
    <div className={styles.popoverContent}>
      <MessageThread />
      <IntentInput placeholder="What's up?" />
      <div className={styles.fullScreenBtn}>
        <Link to={routePaths[AppPage.HOME]}>
          <IconBtn
            icon={<ArrowsOutSimple size={16} onClick={onClickFullScreen} />}
          />
        </Link>
      </div>
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
          },
        }}
      >
        <div className={styles.bar} />
      </Popover>
    </div>
  );
};
