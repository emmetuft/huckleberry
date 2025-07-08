import { FC } from 'react';
import styles from './App.module.scss';
import { Nav } from 'components/Nav/Nav';
import { RecCard } from 'components/RecCard/RecCard';
import { Workspace } from 'components/Workspace/Workspace';
import { Background } from 'components/Background/Background';

export const App: FC = () => (
  <div className={styles.App}>
    <Background />
    <Nav />
    <RecCard />
    <Workspace />
  </div>
);
