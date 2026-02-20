import { FC } from 'react';
import { Link } from 'react-router-dom';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './PublicHeader.module.scss';

export const PublicHeader: FC = () => {
  return (
    <header className={styles.PublicHeader}>
      <div className={styles.container}>
        <Link to={publicRoutePaths[PublicPage.LANDING]} className={styles.logo}>
          Huckleberry
        </Link>

        <nav className={styles.nav}>
          <Link to={publicRoutePaths[PublicPage.ABOUT]}>About</Link>
          <Link to={publicRoutePaths[PublicPage.FEATURES]}>Features</Link>
          <Link to={publicRoutePaths[PublicPage.PRICING]}>Pricing</Link>
          <Link to={publicRoutePaths[PublicPage.DOCS]}>Docs</Link>
        </nav>

        <div className={styles.authButtons}>
          <Link
            to={publicRoutePaths[PublicPage.LOGIN]}
            className={styles.login}
          >
            Login
          </Link>
          <Link
            to={publicRoutePaths[PublicPage.SIGNUP]}
            className={styles.signup}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};
