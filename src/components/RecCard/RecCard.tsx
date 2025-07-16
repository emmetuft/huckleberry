import { FC, useEffect, useRef } from 'react';
import { X } from 'phosphor-react';
import styles from './RecCard.module.scss';
import { recommendations } from 'constants/recommendations';
import { IconBtn } from 'components/IconBtn/IconBtn';

interface RecCardProps {
  setShowRecs: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RecCard: FC<RecCardProps> = ({ setShowRecs }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsidePopup =
        popupRef.current && popupRef.current.contains(target);

      if (!clickedInsidePopup) {
        setShowRecs(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // const sections = ['today', 'this week', 'older'];

  return (
    <div className={styles.RecCard} ref={popupRef}>
      <div className={styles.heading}>
        <div className={styles.title}>
          <h3>Recommended for you</h3>
          <IconBtn icon={<X />} onClick={() => setShowRecs(false)} />
        </div>
        <p>Fresh ideas relevant to your work.</p>
      </div>
      {/* {sections.map((section) => ( */}
      <div className={styles.section}>
        {/* <div className={styles.sectionHeader}>
            <h4>{section}</h4>
          </div> */}
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
      </div>
      {/* ))} */}
    </div>
  );
};
