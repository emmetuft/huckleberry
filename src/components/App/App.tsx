import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import styles from './App.module.scss';
import { useAppDispatch } from 'reducers';
import { fetchUserPersona } from 'reducers/app/actions';
import { fetchIdentity, selectIdentity, selectPage } from 'reducers/app/slice';
import { Background } from 'components/Background/Background';
import { Nav } from 'components/Nav/Nav';
import { RecCard } from 'components/RecCard/RecCard';
import { Workspace } from 'components/Workspace/Workspace';
import { FlowCanvas } from 'components/FlowCanvas/FlowCanvas';
import { PersonaModal } from 'components/PersonaModal/PersonaModal';
import { AppPage } from 'models/enums/appPage';

export const App: FC = () => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);
  const page = useSelector(selectPage);

  useEffect(() => {
    dispatch(fetchIdentity());
  }, []);

  useEffect(() => {
    if (identity) {
      dispatch(fetchUserPersona());
    }
  }, [identity]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5a0cff',
        },
      }}
    >
      <div className={styles.App}>
        <Nav />
        <PersonaModal />
        {page === AppPage.HOME ? (
          <div className={styles.home}>
            <Workspace />
            {/* <RecCard /> */}
            <Background />
          </div>
        ) : AppPage.WORKFLOW ? (
          <FlowCanvas />
        ) : null}
      </div>
    </ConfigProvider>
  );
};
