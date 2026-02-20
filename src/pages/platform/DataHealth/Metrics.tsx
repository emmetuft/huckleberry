import {
  Database,
  Eye,
  Gauge,
  HourglassMedium,
  ShieldCheck,
  Timer,
} from 'phosphor-react';
import styles from './DataHealth.module.scss';
import { IconType, metricList } from 'constants/health';
import { sharedIconProps } from 'constants/styles';
import { Quality, qualityColorMap } from 'models/enums/quality';

const Metrics = () => {
  const actionIconMap = {
    [IconType.SHIELD_CHECK]: <ShieldCheck {...sharedIconProps} />,
    [IconType.SPEEDOMETER]: <Gauge {...sharedIconProps} />,
    [IconType.EYE]: <Eye {...sharedIconProps} />,
    [IconType.HOURGLASS]: <HourglassMedium {...sharedIconProps} />,
    [IconType.DATABASE]: <Database {...sharedIconProps} />,
    [IconType.TIMER]: <Timer {...sharedIconProps} />,
  };

  return (
    <div className={styles.metrics}>
      <div className={styles.metricsGrid}>
        {metricList.map((metric) => (
          <div key={metric.id} className={styles.metricCard}>
            <div className={styles.left}>
              <div
                className={`${styles.metricIcon} ${
                  metric.quality === Quality.BAD
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
