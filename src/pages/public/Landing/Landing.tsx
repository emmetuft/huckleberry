import { FC } from 'react';
import { Link } from 'react-router-dom';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './Landing.module.scss';

export const Landing: FC = () => {
  return (
    <div className={styles.Landing}>
      <section className={styles.hero}>
        <h1>Welcome to Huckleberry</h1>
        <p>AI-powered data intelligence platform for modern enterprises</p>
        <div className={styles.cta}>
          <Link
            to={publicRoutePaths[PublicPage.SIGNUP]}
            className={styles.primary}
          >
            Get Started
          </Link>
          <Link
            to={publicRoutePaths[PublicPage.FEATURES]}
            className={styles.secondary}
          >
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
};
