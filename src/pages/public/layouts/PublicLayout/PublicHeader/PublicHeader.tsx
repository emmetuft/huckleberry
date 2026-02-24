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
        <h2>Work smarter.</h2>
      </Link>

      {/* <nav className={styles.nav}>
        <Link to={publicRoutePaths[PublicPage.ABOUT]}>Product</Link>
        <Link to={publicRoutePaths[PublicPage.FEATURES]}>Stories</Link>
        <Link to={publicRoutePaths[PublicPage.PRICING]}>Pricing</Link>
        <Link to={publicRoutePaths[PublicPage.DOCS]}>Docs</Link>
      </nav> */}

      <div className={styles.authButtons}>
        <Link to={publicRoutePaths[PublicPage.LOGIN]}>Sign in</Link>
        <Link
          to={publicRoutePaths[PublicPage.SIGNUP]}
          className={styles.signup}
        >
          Try for free
        </Link>
      </div>
    </header>
  );
};
