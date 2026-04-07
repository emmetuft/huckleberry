import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Tabs, TabsProps } from 'antd';
import { useAppDispatch } from 'reducers';
import { selectPersona } from 'reducers/app/slice';
import { saveUserPersona } from 'reducers/app/actions';
import { Persona } from 'models/interfaces/persona';
import { defaultPersona } from 'constants/persona';
import { AccountsTab } from 'pages/platform/Profile/AccountsTab/AccountsTab';
import { SettingsTab } from 'pages/platform/Profile/SettingsTab/SettingsTab';
import { PersonaTab } from './PersonaTab/PersonaTab';
import styles from './ProfilePage.module.css';

export const ProfilePage: FC = () => {
  const dispatch = useAppDispatch();
  const persona = useSelector(selectPersona);

  const [editedPersona, setEditedPersona] = useState<Persona>(
    persona ?? (defaultPersona as Persona),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (persona) setEditedPersona(persona);
  }, [persona]);

  const onSaveSettings = async () => {
    setSaving(true);
    await dispatch(saveUserPersona(editedPersona));
    setSaving(false);
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
      children: (
        <div className={styles.tabContent}>
          <AccountsTab />
        </div>
      ),
    },
    {
      key: 'ai-access',
      label: 'AI Access',
      children: (
        <div className={styles.tabContent}>
          <SettingsTab />
          <Button type="primary" onClick={onSaveSettings} loading={saving}>
            Save
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.ProfilePage}>
      <Tabs items={tabItems} />
    </div>
  );
};
