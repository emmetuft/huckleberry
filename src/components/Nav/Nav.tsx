import { FC } from 'react';
import { Database, TreeStructure } from 'phosphor-react';
import styles from './Nav.module.scss';
import { IconBtn } from 'components/IconBtn/IconBtn';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  return (
    <div className={styles.Nav}>
      {/* <div className={styles.logo}>Logo</div> */}
      <div className={styles.buttons}>
        <IconBtn icon={<Database size={24} />} />
        <IconBtn icon={<TreeStructure size={24} />} />
      </div>
    </div>
  );
};
