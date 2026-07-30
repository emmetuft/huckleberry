import { FC } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Tag } from 'antd';
import { HammerIcon } from '@phosphor-icons/react';
import styles from './Workspace.module.css';
import { selectIdentity } from 'reducers/app/slice';
import {
  staggerChildrenMotionProps,
  staggeredChildMotionProps,
} from 'constants/styles';
import { IntentInput } from 'components/comms/IntentInput/IntentInput';
import { OverviewSection } from './OverviewSection/OverviewSection';
import { getFirstName, getTimeOfDay } from 'utils/misc';
import { formatCurrentDate } from 'utils/datetime';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  const identity = useSelector(selectIdentity);

  return (
    <div className={styles.snapContainer}>
      <section className={styles.heroSection}>
        <div className={styles.workspace}>
          <motion.div
            className={styles.greeting}
            {...staggerChildrenMotionProps}
          >
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
            <motion.div
              className={styles.currentDate}
              {...staggeredChildMotionProps}
            >
              {formatCurrentDate()}
            </motion.div>
          </motion.div>
          <IntentInput animate />
        </div>
      </section>
      <OverviewSection />
    </div>
  );
};
