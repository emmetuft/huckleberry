import { FC } from 'react';
import {
  ArticleIcon,
  LightningIcon,
  UserCirclePlusIcon,
} from '@phosphor-icons/react';
import styles from './RecCard.module.css';
import {
  Recommendation,
  recommendations,
  RecommendationType,
} from 'constants/recommendations';
import { PopupCard } from 'components/shared/PopupCard/PopupCard';

interface RecCardProps {
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RecCard: FC<RecCardProps> = ({ setShowCard }) => {
  const onClickRec = (rec: Recommendation) => {
    if (rec.url) {
      window.open(rec.url, '_blank');
    }
  };

  const iconMap: Record<RecommendationType, JSX.Element> = {
    [RecommendationType.Workflow]: <LightningIcon size={20} />,
    [RecommendationType.Article]: <ArticleIcon size={20} />,
    [RecommendationType.Contact]: <UserCirclePlusIcon size={20} />,
  };

  return (
    <PopupCard
      title="Recommended for you"
      description="Fresh ideas relevant to your work."
      children={
        <div className={styles.sectionItems}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={styles.item}
              onClick={() => onClickRec(rec)}
            >
              <div className={styles.top}>
                <div className={styles.title}>
                  <div className={styles.icon}>{iconMap[rec.type]}</div>
                  <p>{rec.title}</p>
                </div>
                <div className={styles.actionPill}>{rec.actionLabel}</div>
              </div>
              <div className={styles.description}>
                <p>{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      }
      setShowCard={setShowCard}
    />
  );
};
