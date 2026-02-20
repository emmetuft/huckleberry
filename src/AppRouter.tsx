import { FC } from 'react';
import { useRoutes } from 'react-router-dom';
import { publicRoutes } from 'pages/public/routes';
import { platformRoutes } from 'pages/platform/routes';

export const AppRouter: FC = () => {
  const routing = useRoutes([...publicRoutes, ...platformRoutes]);
  return <>{routing}</>;
};
