import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Tabs, TabsProps } from 'antd';
import styles from './ProfilePage.module.css';
import { AccountsTab } from 'pages/platform/Profile/AccountsTab/AccountsTab';
import { SettingsTab } from 'pages/platform/Profile/SettingsTab/SettingsTab';
import { PersonaTab } from './PersonaTab/PersonaTab';
import { AuthService } from 'services/auth';

export const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await AuthService.logout();
    } finally {
      navigate('/login');
    }
  };

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
    <div className={`platformPage ${styles.profilePage}`}>
      <Tabs items={tabItems} />
      <div className={styles.logoutButton}>
        <Button danger onClick={() => setLogoutModalOpen(true)}>
          Sign out
        </Button>
      </div>

      <Modal
        title="Sign out"
        open={logoutModalOpen}
        onOk={handleLogout}
        onCancel={() => setLogoutModalOpen(false)}
        okText="Sign out"
        okButtonProps={{ danger: true, loading: loggingOut }}
      >
        <p>Are you sure you want to sign out?</p>
      </Modal>
    </div>
  );
};
