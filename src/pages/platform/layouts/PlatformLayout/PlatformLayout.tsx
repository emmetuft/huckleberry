import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Toaster } from 'sonner';
import { useAppDispatch } from 'reducers';
import { fetchUserPersona } from 'reducers/app/actions';
import { selectIdentity, setPage } from 'reducers/app/slice';
import { fetchMetricCatalogSchema } from 'reducers/metrics/actions';
import { fetchGroups, fetchUsers } from 'reducers/people/actions';
import { Heading } from './Heading/Heading';
import { Nav } from './Nav/Nav';
import { PromptBar } from 'components/comms/PromptBar/PromptBar';
import { PersonaModal } from 'components/modals/PersonaModal/PersonaModal';
import { getAppPageFromPath } from 'models/enums/appPage';
import styles from './PlatformLayout.module.scss';

export const PlatformLayout: FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const identity = useSelector(selectIdentity);

  // Fetch platform data when identity is available
  useEffect(() => {
    if (identity) {
      dispatch(fetchUserPersona());
      dispatch(fetchMetricCatalogSchema());
      dispatch(fetchUsers());
      dispatch(fetchGroups());
    }
  }, [identity, dispatch]);

  // Sync Redux state with current route
  useEffect(() => {
    const appPage = getAppPageFromPath(location.pathname);
    dispatch(setPage(appPage));
  }, [location.pathname, dispatch]);

  // Hide PromptBar on workspace page (/workspace)
  const hidePromptBar = location.pathname === '/workspace';

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
      <div className={styles.PlatformLayout}>
        <Heading />
        <Nav />
        {!hidePromptBar && <PromptBar />}
        <PersonaModal />
        <Outlet />
      </div>
      <Toaster position="top-right" theme="light" richColors />
    </ConfigProvider>
  );
};
