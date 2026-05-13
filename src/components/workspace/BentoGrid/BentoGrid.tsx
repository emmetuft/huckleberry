import { FC } from 'react';
import { motion } from 'framer-motion';
import { BentoLayout } from 'config/bentoConfig';
import { WorkspaceCard } from '../WorkspaceCard/WorkspaceCard';
import styles from './BentoGrid.module.css';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as 'easeOut' },
  },
};

interface BentoGridProps {
  layout: BentoLayout;
  dismissedCards: string[];
  onDismiss: (id: string) => void;
}

export const BentoGrid: FC<BentoGridProps> = ({
  layout,
  dismissedCards,
  onDismiss,
}) => {
  const visibleCards = layout.cards.filter(
    (c) => !dismissedCards.includes(c.id),
  );

  return (
    <motion.div
      className={styles.grid}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {visibleCards.map((card) => (
        <motion.div
          key={card.id}
          variants={cardVariants}
          className={card.colSpan === 2 ? styles.wide : styles.narrow}
        >
          <WorkspaceCard card={card} onDismiss={onDismiss} />
        </motion.div>
      ))}
    </motion.div>
  );
};
