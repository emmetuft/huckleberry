import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import styles from './App.module.scss';
import { useAppDispatch } from 'reducers';
import { fetchUserPersona } from 'reducers/app/actions';
import { fetchIdentity, selectIdentity } from 'reducers/app/slice';
import { Background } from 'components/Background/Background';
import { Nav } from 'components/Nav/Nav';
import { RecCard } from 'components/RecCard/RecCard';
import { Workspace } from 'components/Workspace/Workspace';
import { FlowCanvas } from 'components/FlowCanvas/FlowCanvas';
import { PersonaModal } from 'components/PersonaModal/PersonaModal';

export const App: FC = () => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);

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
        <Background />
        <Nav />
        {/* <RecCard /> */}
        <Workspace />
        <FlowCanvas />
        <PersonaModal />
      </div>
    </ConfigProvider>
  );
};
