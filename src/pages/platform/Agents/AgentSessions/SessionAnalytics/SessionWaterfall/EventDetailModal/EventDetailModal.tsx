import { FC, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '@phosphor-icons/react';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import {
  WaterfallRow,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../SessionWaterfall';
import styles from './EventDetailModal.module.css';
import { Button, Tag } from 'antd';
import { formatDuration } from 'utils/datetime';

interface EventDetailModalProps {
  row: WaterfallRow;
  event: AISessionEvent | null;
  onClose: () => void;
}

export const EventDetailModal: FC<EventDetailModalProps> = ({
  row,
  event,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      className={styles.panel}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <span
            className={styles.categoryDot}
            style={{ backgroundColor: CATEGORY_COLORS[row.category] }}
          />
          <span>{row.label}</span>
        </div>
        <Button type="text" icon={<XIcon size={16} />} onClick={onClose} />
      </div>
      <div className={styles.tagWrapper}>
        <Tag>
          <span className={styles.tagLabel}>category</span>
          <span className={styles.tagValue}>
            {CATEGORY_LABELS[row.category]}
          </span>
        </Tag>
        <Tag>
          <span className={styles.tagLabel}>duration</span>
          <span className={styles.tagValue}>
            {formatDuration(row.durationMs)}
          </span>
        </Tag>
      </div>
      <div className={styles.body}>
        <pre className={styles.eventJson}>{JSON.stringify(event, null, 2)}</pre>
      </div>
    </motion.div>
  );
};
