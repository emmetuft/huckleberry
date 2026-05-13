import { FC, useEffect, useRef } from 'react';
import { XIcon } from '@phosphor-icons/react';
import styles from './PopupCard.module.css';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';

interface PopupCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PopupCard: FC<PopupCardProps> = ({
  title,
  description,
  children,
  setShowCard,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsidePopup =
        popupRef.current && popupRef.current.contains(target);

      if (!clickedInsidePopup) {
        setShowCard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`card ${styles.popupCard}`} ref={popupRef}>
      <div className={styles.heading}>
        <div className={styles.title}>
          <h3>{title}</h3>
          <IconBtn icon={<XIcon />} onClick={() => setShowCard(false)} />
        </div>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
};
