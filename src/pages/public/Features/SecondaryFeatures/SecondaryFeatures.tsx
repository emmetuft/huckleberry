import { FC } from 'react';
import { motion } from 'framer-motion';
import {
  DatabaseIcon,
  ChartBarIcon,
  LightningIcon,
  GitBranchIcon,
  PlugIcon,
  FolderOpenIcon,
} from '@phosphor-icons/react';
import { SECONDARY_FEATURES } from '../mockData';
import styles from './SecondaryFeatures.module.css';

const ICONS = [
  DatabaseIcon,
  ChartBarIcon,
  LightningIcon,
  GitBranchIcon,
  PlugIcon,
  FolderOpenIcon,
];

export const SecondaryFeatures: FC = () => {
  return (
    <div className={styles.section}>
      <motion.div
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.title}>Everything else you need</h2>
        <p className={styles.subtitle}>
          A complete platform, not a collection of disconnected tools.
        </p>
      </motion.div>

      <div className={styles.grid}>
        {SECONDARY_FEATURES.map((feat, i) => {
          const Icon = ICONS[i];
          return (
            <motion.div
              key={feat.title}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div className={styles.iconWrap}>
                <Icon size={22} weight="duotone" />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{feat.title}</h3>
                <p className={styles.cardDesc}>{feat.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
