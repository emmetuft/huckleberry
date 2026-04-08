import { FC } from 'react';
import { Button } from 'antd';
import {
  CalendarBlank,
  GithubLogo,
  SlackLogo,
  Kanban,
  MicrosoftTeamsLogo,
  Note,
} from 'phosphor-react';
import styles from './AccountsTab.module.css';

interface AccountDef {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  connected: boolean;
}

const accounts: AccountDef[] = [
  {
    key: 'google',
    name: 'Google Workspace',
    description: 'Gmail, Calendar, and Drive',
    icon: <CalendarBlank color="white" size={18} />,
    iconColor: '#4285F4',
    connected: false,
  },
  {
    key: 'microsoft',
    name: 'Microsoft Teams',
    description: 'Teams, Outlook, and OneDrive',
    icon: <MicrosoftTeamsLogo color="white" size={18} />,
    iconColor: '#5059C9',
    connected: false,
  },
  {
    key: 'github',
    name: 'GitHub',
    description: 'Repositories, pull requests, and issues',
    icon: <GithubLogo color="white" size={18} />,
    iconColor: '#101411',
    connected: false,
  },
  {
    key: 'slack',
    name: 'Slack',
    description: 'Channels, messages, and notifications',
    icon: <SlackLogo color="white" size={18} />,
    iconColor: '#4A154B',
    connected: false,
  },
  {
    key: 'jira',
    name: 'Jira',
    description: 'Issues, projects, and cycles',
    icon: <Kanban color="white" size={18} />,
    iconColor: '#0052CC',
    connected: false,
  },
  {
    key: 'notion',
    name: 'Notion',
    description: 'Docs, wikis, and databases',
    icon: <Note color="white" size={18} />,
    iconColor: '#000000',
    connected: false,
  },
];

export const AccountsTab: FC = () => {
  return (
    <div className={styles.AccountsTab}>
      <div className={styles.accountsGrid}>
        {accounts.map((account) => (
          <div key={account.key} className="appCard">
            <div
              className="defaultAppIcon"
              style={{ backgroundColor: account.iconColor }}
            >
              {account.icon}
            </div>
            <div className="appInfo" style={{ flex: 1 }}>
              <h4>{account.name}</h4>
              <p>{account.description}</p>
            </div>
            <div className={styles.connectAction}>
              <Button size="small">
                {account.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
