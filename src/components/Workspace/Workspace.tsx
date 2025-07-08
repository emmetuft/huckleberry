import { FC } from 'react';

import styles from './Workspace.module.scss';

interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = ({}) => {
  return <div className={styles.Workspace}>Workspace</div>;
};
