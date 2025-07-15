import { FC } from 'react';
import { motion } from 'framer-motion';
import styles from './Chat.module.scss';
import { IntentInput } from 'components/IntentInput/IntentInput';
import { ResourceList } from 'components/Resources/ResourceList/ResourceList';

interface ChatProps {}

export const Chat: FC<ChatProps> = ({}) => {
  return (
    <div className={styles.Chat}>
      <motion.p
        className={styles.greeting}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        Let's automate
      </motion.p>
      <IntentInput placeholder={"What's the first domino?"} />
      <ResourceList tab="startSteps" />
    </div>
  );
};
