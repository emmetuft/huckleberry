import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './FeatureSection.module.css';

interface FeatureSectionProps {
  label: string;
  title: string;
  description: string;
  bullets?: string[];
  demo: ReactNode;
  reversed?: boolean;
}

export const FeatureSection: FC<FeatureSectionProps> = ({
  label,
  title,
  description,
  bullets,
  demo,
  reversed = false,
}) => {
  return (
    <motion.div
      className={`${styles.section} ${reversed ? styles.reversed : ''}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={styles.copy}>
        <span className={styles.label}>{label}</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        {/* {bullets && (
          <ul className={styles.bullets}>
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )} */}
      </div>
      <div className={styles.demo}>{demo}</div>
    </motion.div>
  );
};
