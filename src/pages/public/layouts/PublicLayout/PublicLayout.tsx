import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import styles from './PublicLayout.module.scss';
import { PublicHeader } from './PublicHeader/PublicHeader';
import { PublicFooter } from './PublicFooter/PublicFooter';

export const PublicLayout: FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5a0cff',
        },
        components: {
          Segmented: {
            itemSelectedBg: '#e6e9ff',
            itemSelectedColor: '#5a0cff',
          },
        },
      }}
    >
      <div className={styles.PublicLayout}>
        <PublicHeader />
        <main className={styles.content}>
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </ConfigProvider>
  );
};
