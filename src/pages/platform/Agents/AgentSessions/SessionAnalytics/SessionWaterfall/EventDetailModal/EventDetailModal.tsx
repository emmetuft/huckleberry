import { FC, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Tag, Tooltip } from 'antd';
import { XIcon, CopySimpleIcon, CheckIcon } from '@phosphor-icons/react';
import styles from './EventDetailModal.module.css';
import { AISessionEvent } from 'models/interfaces/sessionEvent';
import { WaterfallRow } from '../SessionWaterfall';
import { formatDuration } from 'utils/datetime';
import { CATEGORY_COLORS, CATEGORY_LABELS } from 'utils/sessionGraph';

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
        <div className={styles.bodyHeader}>
          <Tooltip title={copied ? 'Copied!' : 'Copy JSON'}>
            <Button
              type="text"
              size="small"
              icon={
                copied ? <CheckIcon size={14} /> : <CopySimpleIcon size={14} />
              }
              onClick={handleCopy}
            />
          </Tooltip>
        </div>
        <pre className={styles.eventJson}>{JSON.stringify(event, null, 2)}</pre>
      </div>
    </motion.div>
  );
};
