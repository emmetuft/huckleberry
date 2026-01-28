import { FC } from 'react';
import { Button } from 'antd';
import styles from './index.module.scss';
import { Persona } from 'models/interfaces/persona';

interface AccountsTabProps {
  editedPersona: Persona;
  setEditedPersona: React.Dispatch<React.SetStateAction<Persona>>;
}

export const AccountsTab: FC<AccountsTabProps> = ({
  editedPersona,
  setEditedPersona,
}) => {
  const onChangePersona = (field: keyof Persona, value: string) => {
    setEditedPersona((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={styles.tab}>
      <Button>Connect your calendar</Button>
    </div>
  );
};
