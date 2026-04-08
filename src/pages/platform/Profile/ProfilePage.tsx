import { FC } from 'react';
import { Tabs, TabsProps } from 'antd';
import { AccountsTab } from 'pages/platform/Profile/AccountsTab/AccountsTab';
import { SettingsTab } from 'pages/platform/Profile/SettingsTab/SettingsTab';
import { PersonaTab } from './PersonaTab/PersonaTab';
import styles from './ProfilePage.module.css';

export const ProfilePage: FC = () => {
  const tabItems: TabsProps['items'] = [
    {
      key: 'persona',
      label: 'Persona',
      children: <PersonaTab />,
    },
    {
      key: 'accounts',
      label: 'Accounts',
      children: <AccountsTab />,
    },
    {
      key: 'settings',
      label: 'AI Settings',
      children: <SettingsTab />,
    },
  ];

  return (
    <div className={styles.ProfilePage}>
      <Tabs items={tabItems} />
    </div>
  );
};
