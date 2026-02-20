import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Radio, Tabs, TabsProps } from 'antd';
import styles from './PersonaModal.module.scss';
import { useAppDispatch } from 'reducers';
import {
  saveUserPersona,
  selectIdentity,
  selectPersona,
  selectPersonaModalOpen,
  setPersonaModal,
} from 'reducers/app/slice';
import { defaultPersona } from 'constants/persona';
import { Persona } from '../../../../shared/models/interfaces/persona';
import { PersonaTab } from './tabs/PersonaTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AccountsTab } from './tabs/AccountsTab';
import { swapPersona } from 'reducers/app/actions';

interface PersonaModalProps {}

export const PersonaModal: FC<PersonaModalProps> = ({}) => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);
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

  const onChangePersona = (e: any) => {
    dispatch(swapPersona(e.target.value));
  };

  const onChangeTab = (key: string) => {
    console.log('Active tab:', key);
  };

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
      children: <AccountsTab />,
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
      width={800}
    >
      <div className={styles.personaSwitch}>
        <Radio.Group
          value={identity?.userId}
          buttonStyle="solid"
          onChange={onChangePersona}
        >
          <Radio.Button value={1249569521}>Emme Tuft</Radio.Button>
          <Radio.Button value={1250228141}>Mark Boothe</Radio.Button>
        </Radio.Group>
      </div>
      <Tabs defaultActiveKey="1" items={items} onChange={onChangeTab} />
    </Modal>
  );
};
