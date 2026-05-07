import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './PublicHeader.module.css';

export const PublicHeader: FC = () => {
  return (
    <header className={styles.publicHeader}>
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
        <Button shape="round" size="large">
          Sign in
        </Button>
        <Button type="primary" shape="round" size="large">
          Try for free
        </Button>
      </div>
    </header>
  );
};
