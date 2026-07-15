import { FC, ReactNode } from 'react';
import styles from './AttentionCard.module.css';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { AttentionCardStatus } from 'models/enums/attentionCardStatus';
import { formatCardTimestamp, getRelativeNoticeTime } from 'utils/datetime';
import { Button } from 'antd';

interface AttentionCardOwner {
  name: string;
  userId?: number;
  role?: string;
}

export interface AttentionCardProps {
  id: string;
  category: string;
  status: AttentionCardStatus;
  /** ISO timestamp string — used to compute relative time for Noticed cards and format the right-side meta */
  timestamp: string;
  title?: string;
  isNew?: boolean;
  owner?: AttentionCardOwner;
  footerContent?: ReactNode;
  children?: ReactNode;
}

const STATUS_COLOR: Record<AttentionCardStatus, string> = {
  [AttentionCardStatus.UnderReview]: 'var(--node-green)',
  [AttentionCardStatus.Noticed]: 'var(--grey-text)',
};

const STATUS_LABEL: Record<AttentionCardStatus, (timestamp: string) => string> =
  {
    [AttentionCardStatus.UnderReview]: () => 'Under review',
    [AttentionCardStatus.Noticed]: (ts) =>
      `Noticed ${getRelativeNoticeTime(ts)}`,
  };

export const AttentionCard: FC<AttentionCardProps> = ({
  category,
  status,
  timestamp,
  title,
  isNew = false,
  owner,
  footerContent,
  children,
}) => {
  const color = isNew ? 'var(--node-orange)' : STATUS_COLOR[status];
  const statusLabel = STATUS_LABEL[status](timestamp);
  const rightMeta = `${category} · ${formatCardTimestamp(timestamp)}`;

  return (
    <div
      className={`card ${styles.attentionCard} ${isNew ? styles.isNew : ''}`}
    >
      <div className={styles.cardTopRow}>
        <div className={styles.categoryRow}>
          {isNew && (
            <span className={styles.dot} style={{ background: color }} />
          )}
          <span className={styles.categoryLabel} style={{ color }}>
            {statusLabel}
          </span>
        </div>
        <span className={styles.cardMeta}>{rightMeta}</span>
      </div>

      {title && <h3 className={styles.cardTitle}>{title}</h3>}

      {children}

      {owner && (
        <div className={styles.cardOwner}>
          <Avatar name={owner.name} userId={owner.userId} showName />
          {owner.role && (
            <span className={styles.ownerRole}>· {owner.role}</span>
          )}
        </div>
      )}

      {status == AttentionCardStatus.Noticed && (
        <div className={styles.cardFooter}>
          {footerContent && (
            <div className={styles.footerContent}>{footerContent}</div>
          )}
          <Button size="small" shape="round" className={styles.footerButton}>
            View evidence
          </Button>
        </div>
      )}
    </div>
  );
};
