import { FC, useEffect } from 'react';
import styles from './index.module.scss';
import { focusAreas, groupedDepartments } from 'constants/persona';
import { InputType } from 'models/enums/inputType';
import { Persona } from 'models/interfaces/persona';
import { LabelInput } from '../LabelInput';

interface PersonaTabProps {
  editedPersona: Persona;
  setEditedPersona: React.Dispatch<React.SetStateAction<Persona>>;
}

export const PersonaTab: FC<PersonaTabProps> = ({
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
        inputType={InputType.Text}
        label="Role"
        value={editedPersona.role}
        onChange={(val: any) => onChangePersona('role', val)}
      />
      <LabelInput
        inputType={InputType.Select}
        label="Department"
        value={editedPersona.department}
        options={groupedDepartments.map((group) => ({
          label: group.label,
          title: group.label,
          options: group.options.map((option) => ({
            label: option,
            value: option,
          })),
        }))}
        onChange={(val: any) => onChangePersona('department', val)}
      />
      <LabelInput
        inputType={InputType.Tags}
        label="Focus areas"
        value={editedPersona.focusAreas}
        options={focusAreas.map((focus) => ({ label: focus, value: focus }))}
        onChange={(val: any) => onChangePersona('focusAreas', val)}
      />
    </div>
  );
};
