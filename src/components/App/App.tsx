import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useRoutes } from 'react-router-dom';
import { routes, getAppPageFromPath } from 'routes';
import { ConfigProvider } from 'antd';
import { Toaster } from 'sonner';
import styles from './App.module.scss';
import { useAppDispatch } from 'reducers';
import { fetchUserPersona } from 'reducers/app/actions';
import {
  authenticate,
  fetchIdentity,
  selectIdentity,
  setPage,
} from 'reducers/app/slice';
import { Heading } from 'components/Heading/Heading';
import { Nav } from 'components/Nav/Nav';
import { PersonaModal } from 'components/PersonaModal/PersonaModal';

export const App: FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const identity = useSelector(selectIdentity);
  const routing = useRoutes(routes);

  const init = useRef<boolean>(false);

  useEffect(() => {
    if (init.current) return;
    init.current = true;
    dispatch(authenticate());
    dispatch(fetchIdentity());
  }, []);

  useEffect(() => {
    if (identity) {
      dispatch(fetchUserPersona());
    }
  }, [identity]);

  // Sync Redux state with current route
  useEffect(() => {
    const appPage = getAppPageFromPath(location.pathname);
    dispatch(setPage(appPage));
  }, [location.pathname]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5a0cff',
        },
        components: {
          Menu: {
            itemActiveBg: '#e6e9ff',
            itemSelectedBg: '#e6e9ff',
          },
          Table: {
            borderColor: '#f8f8f8',
            headerBg: '#fff',
            footerBg: '#fff',
          },
        },
      }}
    >
      <div className={styles.App}>
        <Heading />
        <Nav />
        <PersonaModal />
        {routing}
      </div>
      <Toaster position="top-right" theme="light" richColors />
    </ConfigProvider>
  );
};
