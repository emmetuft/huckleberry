import {
  DatabaseIcon,
  EyeIcon,
  GaugeIcon,
  HourglassMediumIcon,
  ShieldCheckIcon,
  TimerIcon,
} from '@phosphor-icons/react';
import styles from './DataHealth.module.css';
import { IconType, metricList } from 'constants/health';
import { Quality, qualityColorMap } from 'models/enums/quality';
import { useIsMobile } from 'hooks/useIsMobile';

const Metrics = () => {
  const isMobile = useIsMobile();
  const iconSize = isMobile ? 18 : 24;

  const actionIconMap = {
    [IconType.SHIELD_CHECK]: <ShieldCheckIcon size={iconSize} />,
    [IconType.SPEEDOMETER]: <GaugeIcon size={iconSize} />,
    [IconType.EYE]: <EyeIcon size={iconSize} />,
    [IconType.HOURGLASS]: <HourglassMediumIcon size={iconSize} />,
    [IconType.DATABASE]: <DatabaseIcon size={iconSize} />,
    [IconType.TIMER]: <TimerIcon size={iconSize} />,
  };

  return (
    <div className={styles.metrics}>
      <div className={styles.metricsGrid}>
        {metricList.map((metric) => (
          <div key={metric.id} className={styles.metricCard}>
            <div className={styles.left}>
              <div
                className={`${styles.metricIcon} ${
                  metric.quality === Quality.BAD ? styles.warning : ''
                }`}
              >
                {actionIconMap[metric.icon]}
              </div>
              <div className={styles.details}>
                <h2>{metric.title}</h2>
                {!isMobile && <p>{metric.description}</p>}
              </div>
            </div>
            <div className={styles.right}>
              <span
                className={styles.score}
                style={{ color: qualityColorMap[metric.quality] }}
              >
                {metric.score}
              </span>
              <p>{metric.scoreDescription}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Metrics;
