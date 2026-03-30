import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRoutes } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { publicRoutes } from 'pages/public/routes';
import { platformRoutes } from 'pages/platform/routes';
import { selectTheme } from 'reducers/app/slice';

export const AppRouter: FC = () => {
  const routing = useRoutes([...publicRoutes, ...platformRoutes]);
  const theme = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      {routing}
    </ConfigProvider>
  );
};
