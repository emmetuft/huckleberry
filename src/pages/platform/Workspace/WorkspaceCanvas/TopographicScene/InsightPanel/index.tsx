import { FC, ReactElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircleIcon,
  InfoIcon,
  MountainsIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import styles from './index.module.css';
import { InsightSeverity, TopoInsight } from 'models/interfaces/topoInsight';

const DISPLAY_LIMIT = 4;

const SEVERITY_ICON: Record<InsightSeverity, ReactElement> = {
  [InsightSeverity.Warning]: <WarningCircleIcon size={14} weight="fill" />,
  [InsightSeverity.Info]: <InfoIcon size={14} weight="fill" />,
  [InsightSeverity.Success]: <CheckCircleIcon size={14} weight="fill" />,
};

interface InsightPanelProps {
  insights: TopoInsight[];
}

export const InsightPanel: FC<InsightPanelProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  const visible = insights.slice(0, DISPLAY_LIMIT);
  const overflow = insights.length - DISPLAY_LIMIT;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <MountainsIcon size={12} weight="bold" />
        <span className={styles.panelTitle}>Terrain Insights</span>
        <span className={styles.insightCount}>{insights.length}</span>
      </div>

      <div className={styles.cardList}>
        <AnimatePresence>
          {visible.map((insight, i) => (
            <motion.div
              key={insight.type}
              className={`card ${styles.insightCard} ${styles[insight.severity]}`}
              initial={{ opacity: 0, x: 16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut', delay: i * 0.05 }}
            >
              <div className={styles.cardTop}>
                <span
                  className={`${styles.severityIcon} ${styles[insight.severity]}`}
                >
                  {SEVERITY_ICON[insight.severity]}
                </span>
                <span
                  className={`${styles.severityLabel} ${styles[insight.severity]}`}
                >
                  {insight.severity}
                </span>
              </div>

              <p className={styles.cardTitle}>{insight.title}</p>
              <p className={styles.cardDesc}>{insight.description}</p>

              {insight.affectedNodeLabels.length > 0 && (
                <div className={styles.nodeList}>
                  {insight.affectedNodeLabels.map((label) => (
                    <span key={label} className={styles.nodeTag}>
                      {label}
                    </span>
                  ))}
                  {insight.affectedCount > 2 && (
                    <span className={styles.nodeTagMore}>
                      +{insight.affectedCount - 2}
                    </span>
                  )}
                </div>
              )}

              {insight.action && (
                <p className={styles.cardAction}>{insight.action} →</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {overflow > 0 && (
        <p className={styles.overflowNote}>
          +{overflow} more insight{overflow > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};
