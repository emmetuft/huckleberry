import { FC, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import styles from './App.module.scss';
import { useAppDispatch } from 'reducers';
import { fetchIdentity } from 'reducers/app/slice';
import { Background } from 'components/Background/Background';
import { Nav } from 'components/Nav/Nav';
import { RecCard } from 'components/RecCard/RecCard';
import { Workspace } from 'components/Workspace/Workspace';
import { FlowCanvas } from 'components/FlowCanvas/FlowCanvas';

export const App: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchIdentity());
  }, []);

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
      </div>
    </ConfigProvider>
  );
};
