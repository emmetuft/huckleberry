import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader/PublicHeader';
import { PublicFooter } from './PublicFooter/PublicFooter';
import styles from './PublicLayout.module.scss';

export const PublicLayout: FC = () => {
  return (
    <div className={styles.PublicLayout}>
      <PublicHeader />
      <main className={styles.content}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
