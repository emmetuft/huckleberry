import { FC } from 'react';
import { Link } from 'react-router-dom';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './PublicHeader.module.scss';

export const PublicHeader: FC = () => {
  return (
    <header className={styles.PublicHeader}>
      <Link
        to={publicRoutePaths[PublicPage.LANDING]}
        className={styles.logoDetails}
      >
        <img src="/static/logo.svg" className={styles.logo} />
        <h2>Huckleberry</h2>
      </Link>

      <nav className={styles.nav}>
        <Link to={publicRoutePaths[PublicPage.ABOUT]}>About</Link>
        <Link to={publicRoutePaths[PublicPage.FEATURES]}>Features</Link>
        <Link to={publicRoutePaths[PublicPage.PRICING]}>Pricing</Link>
        <Link to={publicRoutePaths[PublicPage.DOCS]}>Docs</Link>
      </nav>

      <div className={styles.authButtons}>
        <Link to={publicRoutePaths[PublicPage.LOGIN]} className={styles.login}>
          Sign in
        </Link>
        <Link
          to={publicRoutePaths[PublicPage.SIGNUP]}
          className={styles.signup}
        >
          Try Huckleberry
        </Link>
      </div>
    </header>
  );
};
