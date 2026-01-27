import { FC } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Workspace.module.scss';
import { selectIdentity } from 'reducers/app/slice';
import { selectFullScreen } from 'reducers/chat/slice';
import { IntentInput } from 'components/comms/IntentInput/IntentInput';
import { Resources } from 'components/Resources/Resources';
import { MessageThread } from 'components/comms/MessageThread/MessageThread';
import { QuickStarts } from 'components/comms/QuickStarts/QuickStarts';
import { getFirstName, getTimeOfDay } from 'utils/misc';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const identity = useSelector(selectIdentity);
  const fullScreen = useSelector(selectFullScreen);

  return (
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
            {`Good ${getTimeOfDay()}${identity ? `, ${getFirstName(identity)}` : ''}!`}
          </motion.p>
        )}
      </AnimatePresence>
      {fullScreen && <MessageThread />}
      <div className={fullScreen ? styles.fullScreenInput : ''}>
        <IntentInput
          animate
          {...(fullScreen ? { placeholder: 'Ask anything' } : {})}
        />
      </div>
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
  );
};
