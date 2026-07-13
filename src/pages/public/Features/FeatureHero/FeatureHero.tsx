import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import { CalendarDotsIcon } from '@phosphor-icons/react';
import styles from './FeatureHero.module.css';
import { PublicPage, publicRoutePaths } from 'models/enums/appPage';
import { useIsMobile } from 'hooks/useIsMobile';

export const FeatureHero: FC = () => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      className={styles.content}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      <span className={styles.eyebrow}>Platform</span>
      <h1 className={styles.title}>
        More than features.
        <br />A new way to work.
      </h1>
      <p className={styles.subtitle}>
        Not just another chat window. Huckleberry connects to your systems,
        builds persistent context, and helps teams make better decisions
        together.
      </p>
      <div className={styles.btns}>
        <Link to={`${publicRoutePaths[PublicPage.LOGIN]}?mode=signup`}>
          <Button
            type="primary"
            shape="round"
            size={isMobile ? 'small' : 'large'}
          >
            Get started for free
          </Button>
        </Link>
        <Button
          shape="round"
          size={isMobile ? 'small' : 'large'}
          icon={<CalendarDotsIcon size={20} />}
        >
          Book a demo
        </Button>
      </div>
    </motion.div>
  );
};
