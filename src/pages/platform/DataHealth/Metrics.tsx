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

const Metrics = () => {
  const actionIconMap = {
    [IconType.SHIELD_CHECK]: <ShieldCheckIcon size={24} />,
    [IconType.SPEEDOMETER]: <GaugeIcon size={24} />,
    [IconType.EYE]: <EyeIcon size={24} />,
    [IconType.HOURGLASS]: <HourglassMediumIcon size={24} />,
    [IconType.DATABASE]: <DatabaseIcon size={24} />,
    [IconType.TIMER]: <TimerIcon size={24} />,
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
                <h3>{metric.title}</h3>
                <p>{metric.description}</p>
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
