import { FC } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Tag } from 'antd';
import { HammerIcon } from '@phosphor-icons/react';
import styles from './Workspace.module.css';
import { useAppDispatch } from 'reducers';
import { selectIdentity } from 'reducers/app/slice';
import { selectPersona } from 'reducers/app/slice';
import { selectFullScreen } from 'reducers/chat/slice';
import { dismissCard, selectDismissedCards } from 'reducers/workspace/slice';
import {
  staggerChildrenMotionProps,
  staggeredChildMotionProps,
} from 'constants/styles';
import { ChatMode } from 'models/enums/chatMode';
import { IntentInput } from 'components/comms/IntentInput/IntentInput';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';
import { QuickStarts } from 'components/comms/QuickStarts/QuickStarts';
import { QuickStart } from 'components/modals/QuickStartModal/QuickStart';
import { BentoGrid } from 'components/workspace/BentoGrid/BentoGrid';
import { Resources } from 'components/workspace/Resources/Resources';
import { getBentoLayout } from 'config/bentoConfig';
import { getFirstName, getTimeOfDay } from 'utils/misc';
import { formatCurrentDate } from 'utils/datetime';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);
  const persona = useSelector(selectPersona);
  const fullScreen = useSelector(selectFullScreen);
  const dismissedCards = useSelector(selectDismissedCards);

  const bentoLayout = getBentoLayout(persona?.department);
  const visibleCards =
    bentoLayout?.cards.filter((c) => !dismissedCards.includes(c.id)) ?? [];
  const isBentoMode = visibleCards.length > 0 && !fullScreen;

  const handleDismiss = (id: string) => dispatch(dismissCard(id));

  const greetingComponent = (
    <motion.div className={styles.greeting} {...staggerChildrenMotionProps}>
      <motion.div {...staggeredChildMotionProps}>
        <Tag
          style={{
            color: 'var(--purple)',
            backgroundColor: 'var(--purple-light)',
            width: 'fit-content',
          }}
        >
          <HammerIcon />
          Under construction
        </Tag>
      </motion.div>
      <motion.h2
        {...staggeredChildMotionProps}
      >{`Good ${getTimeOfDay()}${identity ? `, ${getFirstName(identity.displayName)}` : ''}`}</motion.h2>
      <motion.div className={styles.currentDate} {...staggeredChildMotionProps}>
        {formatCurrentDate()}
      </motion.div>
    </motion.div>
  );

  if (isBentoMode) {
    return (
      <>
        <div className={styles.bentoWorkspace}>
          <div className={`card ${styles.leftPanel}`}>
            {greetingComponent}
            <IntentInput animate />
            {/* <QuickStarts /> */}
            {/* <Resources /> */}
          </div>
          <BentoGrid
            layout={bentoLayout!}
            dismissedCards={dismissedCards}
            onDismiss={handleDismiss}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {/* <QuickStart /> */}
      <div className={styles.workspace}>
        {!fullScreen && greetingComponent}
        {fullScreen ? (
          <ChatContainer
            chatMode={ChatMode.fullScreen}
            placeholder="Ask anything"
            animate
          />
        ) : (
          <IntentInput animate />
        )}
        {/* {!fullScreen && (
          <div>
            <QuickStarts />
            <Resources />
          </div>
        )} */}
      </div>
    </>
  );
};
