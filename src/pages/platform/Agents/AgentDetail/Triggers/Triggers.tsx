import { FC } from 'react';
import {
  ArrowsCounterClockwiseIcon,
  ClockIcon,
  FileArrowUpIcon,
  GearIcon,
  HandPointingIcon,
  NotePencilIcon,
} from '@phosphor-icons/react';
import styles from './Triggers.module.css';
import { motion } from 'framer-motion';
import { DEFAULT_WORKFLOW_STARTS } from 'constants/workflows';
import { defaultMotionProps } from 'constants/styles';

export const Triggers: FC = () => {
  const onClickTrigger = (trigger: {
    id: string;
    name: string;
    description: string;
  }) => {
    console.log('Clicked trigger:', trigger);
  };

  const iconMap: { [key: string]: JSX.Element } = {
    clock: <ClockIcon size={24} />,
    manual: <HandPointingIcon size={24} />,
    upload: <FileArrowUpIcon size={24} />,
    refresh: <ArrowsCounterClockwiseIcon size={24} />,
    form: <NotePencilIcon size={24} />,
    webhook: <GearIcon size={24} />,
  };

  return (
    <div className={styles.triggerList}>
      {DEFAULT_WORKFLOW_STARTS.map((trigger) => (
        <motion.div
          {...defaultMotionProps}
          key={trigger.id}
          className={`${styles.trigger} card`}
          onClick={() => onClickTrigger(trigger)}
        >
          <div className={styles.heading}>
            {iconMap[trigger.icon]}
            <h4>{trigger.name}</h4>
          </div>
          <p>{trigger.description}</p>
        </motion.div>
      ))}
    </div>
  );
};
