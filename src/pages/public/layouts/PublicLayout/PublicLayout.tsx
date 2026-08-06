import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import styles from './PublicLayout.module.css';
import { PublicHeader } from './PublicHeader/PublicHeader';
import { PublicFooter } from './PublicFooter/PublicFooter';

export const PublicLayout: FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#000',
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
      <div className={styles.publicLayout} data-theme="light">
        <PublicHeader />
        <main className={styles.content}>
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </ConfigProvider>
  );
};
