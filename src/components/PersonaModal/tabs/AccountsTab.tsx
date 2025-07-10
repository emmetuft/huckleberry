import { FC } from 'react';
import styles from './index.module.scss';
import { InputType } from 'models/enums/inputType';
import { Persona } from 'models/interfaces/persona';
import { LabelInput } from '../LabelInput';
import { Button } from 'antd';

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
