import { FC } from 'react';
import styles from './RecCard.module.css';
import { recommendations } from 'constants/recommendations';
import { PopupCard } from 'components/shared/PopupCard/PopupCard';

interface RecCardProps {
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RecCard: FC<RecCardProps> = ({ setShowCard }) => {
  return (
    <PopupCard
      title="Recommended for you"
      description="Fresh ideas relevant to your work."
      children={
        <div className={styles.sectionItems}>
          {recommendations.map((rec) => (
            <div key={rec.id} className={styles.item}>
              <div className={styles.top}>
                <div className={styles.title}>
                  <img src="/static/logo.svg" className={styles.itemImg} />
                  <p>{rec.title}</p>
                </div>
                <div className={styles.actionPill}>{rec.actionLabel}</div>
              </div>
              <div className={styles.description}>
                <p>{rec.description}</p>
              </div>
              {rec.url && (
                <a href={rec.url} target="_blank" rel="noopener noreferrer">
                  {rec.url}
                </a>
              )}
            </div>
          ))}
        </div>
      }
      setShowCard={setShowCard}
    />
  );
};
