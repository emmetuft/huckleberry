import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useRoutes } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { publicRoutes } from 'pages/public/routes';
import { platformRoutes } from 'pages/platform/routes';
import { useAppDispatch } from 'reducers';
import { selectTheme } from 'reducers/app/slice';
import { clearMessages, selectSessionId } from 'reducers/chat/slice';
import { AICursor } from 'components/ai-cursor/AICursor';

export const AppRouter: FC = () => {
  const dispatch = useAppDispatch();
  const routing = useRoutes([...publicRoutes, ...platformRoutes]);
  const theme = useSelector(selectTheme);
  const sessionId = useSelector(selectSessionId);
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (sessionId) dispatch(clearMessages());
  }, [pathname]);

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
      <AICursor />
    </ConfigProvider>
  );
};
