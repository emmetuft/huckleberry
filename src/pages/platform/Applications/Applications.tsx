import { FC } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import styles from './Applications.module.scss';
import { selectTab } from 'reducers/applications/slice';
import { appList } from 'constants/applications';
import { defaultMotionProps } from 'constants/styles';
import { AppCard } from './AppCard';
import { Marketplace } from './Marketplace';

interface ApplicationsProps {}

export const Applications: FC<ApplicationsProps> = ({}) => {
  const tab = useSelector(selectTab);

  return (
    <div className={styles.Applications}>
      {tab === 'Apps' ? (
        <div className={styles.tabContent}>
          <motion.div {...defaultMotionProps}>
            <div>
              <h2>Favorites</h2>
              <div className={styles.appGrid}>
                {appList
                  .filter((app) => app.favorite)
                  .map((app) => (
                    <AppCard key={app.id} app={app} />
                  ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...defaultMotionProps}>
            <div>
              <h2>All apps</h2>
              <div className={styles.appGrid}>
                {appList.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <Marketplace />
      )}
    </div>
  );
};
