import {
  Database,
  Eye,
  Gauge,
  HourglassMedium,
  ShieldCheck,
  Timer,
} from 'phosphor-react';
import styles from './DataHealth.module.css';
import { IconType, metricList } from 'constants/health';
import { Quality, qualityColorMap } from 'models/enums/quality';

const Metrics = () => {
  const actionIconMap = {
    [IconType.SHIELD_CHECK]: <ShieldCheck size={24} />,
    [IconType.SPEEDOMETER]: <Gauge size={24} />,
    [IconType.EYE]: <Eye size={24} />,
    [IconType.HOURGLASS]: <HourglassMedium size={24} />,
    [IconType.DATABASE]: <Database size={24} />,
    [IconType.TIMER]: <Timer size={24} />,
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
