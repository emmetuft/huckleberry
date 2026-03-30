import { FC } from 'react';
import styles from './index.module.css';
import { InputType } from 'models/enums/inputType';
import { Persona } from 'models/interfaces/persona';
import { LabelInput } from '../LabelInput';

interface SettingsTabProps {
  editedPersona: Persona;
  setEditedPersona: React.Dispatch<React.SetStateAction<Persona>>;
}

export const SettingsTab: FC<SettingsTabProps> = ({
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
      <LabelInput
        inputType={InputType.Checkbox}
        label="Use my persona for tailored recommendations"
        value={editedPersona.usePersona}
        onChange={(val: any) => onChangePersona('usePersona', val)}
      />
      <LabelInput
        inputType={InputType.Checkbox}
        label="Use my activity history (recent projects, queries)"
        value={editedPersona.useActivity}
        onChange={(val: any) => onChangePersona('useActivity', val)}
      />
      <LabelInput
        inputType={InputType.Checkbox}
        label="Use data context (sources queried, files uploaded)"
        value={editedPersona.useData}
        onChange={(val: any) => onChangePersona('useData', val)}
      />
    </div>
  );
};
