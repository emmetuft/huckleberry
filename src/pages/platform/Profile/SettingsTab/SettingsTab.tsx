import { FC, useState } from 'react';
import { Button, Modal, Select, Switch } from 'antd';
import styles from './SettingsTab.module.css';

interface AIAccessSettings {
  usePersona: boolean;
  useActivity: boolean;
  useData: boolean;
}

interface ModelSettings {
  defaultModel: string;
  verbosity: 'brief' | 'balanced' | 'detailed';
}

interface PrivacySettings {
  optOutDataCollection: boolean;
  historyRetentionDays: number;
}

interface NotificationSettings {
  emailDigest: boolean;
  agentActionAlerts: boolean;
}

const SectionHeader: FC<{ title: string }> = ({ title }) => (
  <div className={styles.sectionHeader}>
    <h3>{title}</h3>
  </div>
);

const SettingRow: FC<{
  label: string;
  description?: string;
  control: React.ReactNode;
}> = ({ label, description, control }) => (
  <div className={styles.settingRow}>
    <div className={styles.settingLabel}>
      <span>{label}</span>
      {description && <p>{description}</p>}
    </div>
    <div className={styles.settingControl}>{control}</div>
  </div>
);

export const SettingsTab: FC = () => {
  const [aiAccess, setAiAccess] = useState<AIAccessSettings>({
    usePersona: true,
    useActivity: false,
    useData: true,
  });

  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    defaultModel: 'claude-sonnet-4-6',
    verbosity: 'balanced',
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    optOutDataCollection: false,
    historyRetentionDays: 30,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailDigest: false,
    agentActionAlerts: true,
  });

  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false);

  const handleClearHistory = () => {
    // TODO: dispatch clear history action
    setClearHistoryModalOpen(false);
  };

  return (
    <div className={styles.tab}>
      <div className={styles.grid}>
        <div className="card">
          <SectionHeader title="AI access" />
          <SettingRow
            label="Persona"
            description="Use your role, skills, and communication style to tailor responses"
            control={
              <Switch
                checked={aiAccess.usePersona}
                onChange={(val) =>
                  setAiAccess((s) => ({ ...s, usePersona: val }))
                }
              />
            }
          />
          <SettingRow
            label="Activity history"
            description="Use your recent queries and projects for context"
            control={
              <Switch
                checked={aiAccess.useActivity}
                onChange={(val) =>
                  setAiAccess((s) => ({ ...s, useActivity: val }))
                }
              />
            }
          />
          <SettingRow
            label="Data context"
            description="Include sources you've queried and files you've uploaded"
            control={
              <Switch
                checked={aiAccess.useData}
                onChange={(val) => setAiAccess((s) => ({ ...s, useData: val }))}
              />
            }
          />
        </div>

        <div className="card">
          <SectionHeader title="Model preferences" />
          <SettingRow
            label="Default model"
            description="The AI model your agents will always use unless otherwise specified"
            control={
              <Select
                value={modelSettings.defaultModel}
                onChange={(val) =>
                  setModelSettings((s) => ({ ...s, defaultModel: val }))
                }
                options={[
                  {
                    label: 'Claude Haiku 4.5 — Fast',
                    value: 'claude-haiku-4-5',
                  },
                  {
                    label: 'Claude Sonnet 4.6 — Balanced',
                    value: 'claude-sonnet-4-6',
                  },
                  {
                    label: 'Claude Opus 4.6 — Powerful',
                    value: 'claude-opus-4-6',
                  },
                ]}
              />
            }
          />
        </div>

        <div className="card">
          <SectionHeader title="Privacy & data" />
          <SettingRow
            label="Opt out of data collection"
            description="Your queries won't be used to improve the product"
            control={
              <Switch
                checked={privacy.optOutDataCollection}
                onChange={(val) =>
                  setPrivacy((s) => ({ ...s, optOutDataCollection: val }))
                }
              />
            }
          />
          <SettingRow
            label="History retention"
            control={
              <Select
                value={privacy.historyRetentionDays}
                onChange={(val) =>
                  setPrivacy((s) => ({ ...s, historyRetentionDays: val }))
                }
                options={[
                  { label: '7 days', value: 7 },
                  { label: '30 days', value: 30 },
                  { label: '90 days', value: 90 },
                  { label: 'Forever', value: -1 },
                ]}
              />
            }
          />
          <SettingRow
            label="Clear activity history"
            description="Permanently delete all past queries and session data"
            control={
              <Button
                danger
                size="small"
                onClick={() => setClearHistoryModalOpen(true)}
              >
                Clear history
              </Button>
            }
          />
        </div>

        <div className="card">
          <SectionHeader title="Notifications" />
          <SettingRow
            label="Email digest"
            description="Receive a daily summary of agent activity"
            control={
              <Switch
                checked={notifications.emailDigest}
                onChange={(val) =>
                  setNotifications((s) => ({ ...s, emailDigest: val }))
                }
              />
            }
          />
          <SettingRow
            label="Agent action alerts"
            description="Get notified when an agent takes an action on your behalf"
            control={
              <Switch
                checked={notifications.agentActionAlerts}
                onChange={(val) =>
                  setNotifications((s) => ({ ...s, agentActionAlerts: val }))
                }
              />
            }
          />
        </div>
      </div>

      <Modal
        title="Clear activity history"
        open={clearHistoryModalOpen}
        onOk={handleClearHistory}
        onCancel={() => setClearHistoryModalOpen(false)}
        okText="Clear history"
        okButtonProps={{ danger: true }}
      >
        <p>
          This will permanently delete all your past queries and session data.
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
