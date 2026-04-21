import { FC } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { BentoCardConfig } from 'config/bentoConfig';
import { PlaceholderViz } from './PlaceholderViz';
import styles from './WorkspaceCard.module.css';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';

interface WorkspaceCardProps {
  card: BentoCardConfig;
  onDismiss: (id: string) => void;
}

export const WorkspaceCard: FC<WorkspaceCardProps> = ({ card, onDismiss }) => {
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{card.title}</span>
          <span className={styles.sampleBadge}>Sample data</span>
        </div>
        <IconBtn
          icon={<XIcon size={16} />}
          onClick={() => onDismiss(card.id)}
        />
      </div>
      <div className={styles.vizWrapper}>
        <PlaceholderViz type={card.type} />
      </div>
      <div className={styles.footer}>
        <button className={styles.connectBtn}>{card.connectLabel} →</button>
      </div>
    </div>
  );
};
