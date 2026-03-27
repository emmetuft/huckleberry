import { FC } from 'react';
import { Link } from 'react-router-dom';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './PublicFooter.module.css';

export const PublicFooter: FC = () => {
  return (
    <footer className={styles.PublicFooter}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h4>Huckleberry</h4>
          <p>AI-powered data intelligence platform</p>
        </div>

        <div className={styles.section}>
          <h4>Product</h4>
          <Link to={publicRoutePaths[PublicPage.FEATURES]}>Features</Link>
          <Link to={publicRoutePaths[PublicPage.PRICING]}>Pricing</Link>
          <Link to={publicRoutePaths[PublicPage.DOCS]}>Documentation</Link>
        </div>

        <div className={styles.section}>
          <h4>Company</h4>
          <Link to={publicRoutePaths[PublicPage.ABOUT]}>About</Link>
        </div>

        <div className={styles.section}>
          <h4>Legal</h4>
          <Link to={publicRoutePaths[PublicPage.TERMS]}>Terms of Service</Link>
          <Link to={publicRoutePaths[PublicPage.PRIVACY]}>Privacy Policy</Link>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>
          &copy; {new Date().getFullYear()} Huckleberry. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
