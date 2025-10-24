import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Cube } from 'phosphor-react';
import { motion } from 'framer-motion';
import styles from './Applications.module.scss';
import { selectTab } from 'reducers/applications/slice';
import { appList } from 'constants/applications';
import { defaultMotionProps } from 'constants/styles';
import { Application } from 'models/interfaces/application';
import { Marketplace } from './Marketplace';

interface ApplicationsProps {}

export const Applications: FC<ApplicationsProps> = ({}) => {
  const tab = useSelector(selectTab);

  const renderApp = (app: Application) => (
    <div key={app.id} className={styles.appCard}>
      {app.iconUrl ? (
        <img src={app.iconUrl} height="100%" width="100%" />
      ) : (
        <div className={styles.defaultAppIcon}>
          <Cube color="white" size={18} />
        </div>
      )}
      <div className={styles.appInfo}>
        <h4>{app.name}</h4>
        <p>{app.description}</p>
      </div>
    </div>
  );

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
                  .map((app) => renderApp(app))}
              </div>
            </div>
          </motion.div>
          <motion.div {...defaultMotionProps}>
            <div>
              <h2>All apps</h2>
              <div className={styles.appGrid}>
                {appList.map((app) => renderApp(app))}
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
