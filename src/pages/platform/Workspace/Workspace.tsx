import { FC } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Tag } from 'antd';
import { HammerIcon } from '@phosphor-icons/react';
import styles from './Workspace.module.css';
import { useAppDispatch } from 'reducers';
import { selectIdentity } from 'reducers/app/slice';
import { selectPersona } from 'reducers/app/slice';
import { selectFullScreen } from 'reducers/chat/slice';
import { dismissCard, selectDismissedCards } from 'reducers/workspace/slice';
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
    <motion.div
      className={styles.greeting}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
      <h2>{`Good ${getTimeOfDay()}${identity ? `, ${getFirstName(identity.displayName)}` : ''}`}</h2>
      <div className={styles.currentDate}>{formatCurrentDate()}</div>
    </motion.div>
  );

  if (isBentoMode) {
    return (
      <>
        <QuickStart />
        <div className={styles.bentoWorkspace}>
          <div className={`card ${styles.leftPanel}`}>
            {greetingComponent}
            <IntentInput animate />
            <QuickStarts />
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
      <QuickStart />
      <div className={styles.workspace}>
        <AnimatePresence>{!fullScreen && greetingComponent}</AnimatePresence>
        {fullScreen ? (
          <ChatContainer
            chatMode={ChatMode.fullScreen}
            placeholder="Ask anything"
            animate
          />
        ) : (
          <IntentInput animate />
        )}
        <AnimatePresence>
          {!fullScreen && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <QuickStarts />
              {/* <Resources /> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
