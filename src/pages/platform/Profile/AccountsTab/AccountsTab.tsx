import { FC } from 'react';
import { Button } from 'antd';
import styles from './AccountsTab.module.css';

interface AccountsTabProps {}

export const AccountsTab: FC<AccountsTabProps> = () => {
  return (
    <div className={styles.tab}>
      <Button>Connect your calendar</Button>
    </div>
  );
};
