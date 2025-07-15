import { FC } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Workspace.module.scss';
import { useAppDispatch } from 'reducers';
import { selectIdentity } from 'reducers/app/slice';
import { Resources } from 'components/Resources/Resources';
import { getFirstName, getTimeOfDay } from 'utils/misc';
import { IntentInput } from 'components/IntentInput/IntentInput';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);

  return (
    <div className={styles.Workspace}>
      <AnimatePresence>
        <motion.p
          className={styles.greeting}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {`Good ${getTimeOfDay()}${identity ? `, ${getFirstName(identity)}` : ''}!`}
        </motion.p>
      </AnimatePresence>
      <IntentInput animate />
      <Resources />
    </div>
  );
};
