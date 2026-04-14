import { FC } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Workspace.module.css';
import { selectIdentity } from 'reducers/app/slice';
import { selectFullScreen } from 'reducers/chat/slice';
import { QuickStart } from 'components/modals/QuickStartModal/QuickStart';
import { IntentInput } from 'components/comms/IntentInput/IntentInput';
import { Resources } from 'components/Resources/Resources';
import { ChatContainer } from 'components/comms/ChatContainer/ChatContainer';
import { ChatMode } from 'models/enums/chatMode';
import { QuickStarts } from 'components/comms/QuickStarts/QuickStarts';
import { getFirstName, getTimeOfDay } from 'utils/misc';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const identity = useSelector(selectIdentity);
  const fullScreen = useSelector(selectFullScreen);

  return (
    <>
      <QuickStart />
      <div className={styles.Workspace}>
        <AnimatePresence>
          {!fullScreen && (
            <motion.p
              className={styles.greeting}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {`Good ${getTimeOfDay()}${identity ? `, ${getFirstName(identity.displayName)}` : ''}!`}
            </motion.p>
          )}
        </AnimatePresence>
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
              <Resources />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
