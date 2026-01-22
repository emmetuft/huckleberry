import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Tabs, TabsProps } from 'antd';
import styles from './PersonaModal.module.scss';
import { useAppDispatch } from 'reducers';
import {
  saveUserPersona,
  selectPersona,
  selectPersonaModalOpen,
  setPersonaModal,
} from 'reducers/app/slice';
import { defaultPersona } from 'constants/persona';
import { Persona } from 'models/interfaces/persona';
import { PersonaTab } from './tabs/PersonaTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AccountsTab } from './tabs/AccountsTab';

interface PersonaModalProps {}

export const PersonaModal: FC<PersonaModalProps> = ({}) => {
  const dispatch = useAppDispatch();
  const userPersona = useSelector(selectPersona);
  const isOpen = useSelector(selectPersonaModalOpen);

  const [editedPersona, setEditedPersona] = useState<Persona>(defaultPersona);

  useEffect(() => {
    if (userPersona) {
      setEditedPersona({
        ...userPersona,
      });
    } else {
      setEditedPersona({
        ...defaultPersona,
      });
    }
  }, [isOpen, userPersona]);

  const onChangeTab = (key: string) => {};

  const onOk = () => {
    dispatch(saveUserPersona(editedPersona));
    dispatch(setPersonaModal(false));
  };

  const onCancel = () => {
    dispatch(setPersonaModal(false));
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Persona',
      children: (
        <PersonaTab
          editedPersona={editedPersona}
          setEditedPersona={setEditedPersona}
        />
      ),
    },
    {
      key: '2',
      label: 'Accounts',
      children: (
        <AccountsTab
          editedPersona={editedPersona}
          setEditedPersona={setEditedPersona}
        />
      ),
    },
    {
      key: '3',
      label: 'AI Access',
      children: (
        <SettingsTab
          editedPersona={editedPersona}
          setEditedPersona={setEditedPersona}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Define your digital twin"
      open={isOpen}
      okText="Save"
      onOk={onOk}
      onCancel={onCancel}
    >
      <Tabs defaultActiveKey="1" items={items} onChange={onChangeTab} />
    </Modal>
  );
};
