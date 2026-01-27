import { FC } from 'react';
import {
  ArrowsCounterClockwise,
  Clock,
  FileArrowUp,
  Gear,
  HandPointing,
  NotePencil,
} from 'phosphor-react';
import styles from './Triggers.module.scss';
import { motion } from 'framer-motion';
import { DEFAULT_WORKFLOW_STARTS } from 'constants/workflows';
import { defaultMotionProps, sharedIconProps } from 'constants/styles';

export const Triggers: FC = () => {
  const onClickTrigger = (trigger: {
    id: string;
    name: string;
    description: string;
  }) => {};

  const iconMap: { [key: string]: JSX.Element } = {
    clock: <Clock {...sharedIconProps} />,
    manual: <HandPointing {...sharedIconProps} />,
    upload: <FileArrowUp {...sharedIconProps} />,
    refresh: <ArrowsCounterClockwise {...sharedIconProps} />,
    form: <NotePencil {...sharedIconProps} />,
    webhook: <Gear {...sharedIconProps} />,
  };

  return (
    <div className={styles.TriggerList}>
      {DEFAULT_WORKFLOW_STARTS.map((trigger) => (
        <motion.div
          {...defaultMotionProps}
          key={trigger.id}
          className={styles.trigger}
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
