import { FC, useEffect } from 'react';
import styles from './App.module.scss';
import { useAppDispatch } from 'reducers';
import { fetchIdentity } from 'reducers/app/slice';
import { Background } from 'components/Background/Background';
import { Nav } from 'components/Nav/Nav';
import { RecCard } from 'components/RecCard/RecCard';
import { Workspace } from 'components/Workspace/Workspace';

export const App: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchIdentity());
  }, []);

  return (
    <div className={styles.App}>
      <Background />
      <Nav />
      {/* <RecCard /> */}
      <Workspace />
    </div>
  );
};
