import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './PublicHeader.module.css';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import { useIsMobile } from 'hooks/useIsMobile';

export const PublicHeader: FC = () => {
  const isMobile = useIsMobile();

  return (
    <header className={styles.publicHeader}>
      <Link
        to={publicRoutePaths[PublicPage.LANDING]}
        className={styles.logoDetails}
      >
        <img src="/static/logo.svg" className={styles.logo} />
        {/* <h2>Work smarter.</h2> */}
      </Link>

      {/* <nav className={styles.nav}>
        <Link to={publicRoutePaths[PublicPage.ABOUT]}>Product</Link>
        <Link to={publicRoutePaths[PublicPage.FEATURES]}>Stories</Link>
        <Link to={publicRoutePaths[PublicPage.PRICING]}>Pricing</Link>
        <Link to={publicRoutePaths[PublicPage.DOCS]}>Docs</Link>
      </nav> */}

      <div className={styles.authButtons}>
        <Link to={publicRoutePaths[PublicPage.LOGIN]}>
          <Button
            type="primary"
            shape="round"
            size={isMobile ? 'small' : 'medium'}
          >
            Sign in
          </Button>
        </Link>
      </div>
    </header>
  );
};
