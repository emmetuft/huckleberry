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
          colorPrimary: '#2a2a2a',
        },
        components: {
          Button: {
            defaultBg: 'transparent',
            defaultBorderColor: '#000',
            defaultHoverBorderColor: '#000',
            defaultActiveBorderColor: '#000',
            defaultHoverBg: 'rgba(0,0,0,0.04)',
            defaultActiveBg: 'rgba(0,0,0,0.08)',
          },
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
