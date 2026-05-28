import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, matchPath, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Toaster } from 'sonner';
import styles from './PlatformLayout.module.css';
import { useAppDispatch } from 'reducers';
import { fetchUserPersona } from 'reducers/app/actions';
import { selectIdentity, selectTheme, setPage } from 'reducers/app/slice';
import { fetchSessions } from 'reducers/chat/actions';
import { fetchGroups, fetchUsers } from 'reducers/people/actions';
import { fetchToolkits } from 'reducers/toolkits/actions';
import {
  AppPage,
  getAppPageFromPath,
  platformRoutePaths,
} from 'models/enums/appPage';
import { PromptBar } from 'components/comms/PromptBar/PromptBar';
import { DuckDBProvider } from 'components/duckdb/DuckDBProvider';
import Database from 'components/duckdb/Database';
import { Heading } from './Heading/Heading';
import { Nav } from './Nav/Nav';

export const PlatformLayout: FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const identity = useSelector(selectIdentity);
  const theme = useSelector(selectTheme);
  const loading = useRef<boolean>(false);

  const isDark = theme === 'dark';

  // Fetch platform data when identity is available
  useEffect(() => {
    if (loading.current) return;
    if (identity) {
      loading.current = true;
      dispatch(fetchUserPersona());
      dispatch(fetchUsers());
      dispatch(fetchGroups());
      dispatch(fetchToolkits());
      dispatch(fetchSessions());
    }
  }, [identity]);

  // Sync Redux state with current route
  useEffect(() => {
    const appPage = getAppPageFromPath(location.pathname);
    dispatch(setPage(appPage));
  }, [location.pathname, dispatch]);

  const isAgentDetail = !!matchPath(
    platformRoutePaths[AppPage.AGENT_DETAIL],
    location.pathname,
  );
  const hidePromptBar = location.pathname === '/workspace' || isAgentDetail;
  const hidePadding = isAgentDetail;

  return (
    <ConfigProvider
      theme={{
        token: {
          // colorPrimary: isDark ? '#8673ffff' : '#5a0cff',
          colorPrimary: isDark ? '#4a4a4a' : '#000',
        },
        components: {
          Menu: {
            itemSelectedBg: isDark ? '#4a4a4a' : '#e9e9e9',
            itemSelectedColor: isDark ? '#fff' : '#000',
          },
          Select: {
            optionSelectedBg: isDark ? '#4a4a4a' : '#e9e9e9',
          },
          Table: {
            headerBg: 'none',
            footerBg: 'none',
          },
          Tag: {
            borderRadiusSM: 999,
          },
        },
      }}
    >
      <DuckDBProvider>
        <div className={styles.platformLayout}>
          <Nav />
          <div
            className={`${styles.pageLayout} ${hidePadding ? styles.noPadding : ''}`}
          >
            <Heading />
            {!hidePromptBar && <PromptBar />}
            <Outlet />
          </div>
        </div>
        <Database />
      </DuckDBProvider>
      <Toaster position="top-right" theme="light" richColors />
    </ConfigProvider>
  );
};
