import { FC } from 'react';
import {
  ArrowsCounterClockwise,
  Clock,
  FileArrowUp,
  Gear,
  HandPointing,
  NotePencil,
} from 'phosphor-react';
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
    clock: <Clock size={24} />,
    manual: <HandPointing size={24} />,
    upload: <FileArrowUp size={24} />,
    refresh: <ArrowsCounterClockwise size={24} />,
    form: <NotePencil size={24} />,
    webhook: <Gear size={24} />,
  };

  return (
    <div className={styles.TriggerList}>
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
