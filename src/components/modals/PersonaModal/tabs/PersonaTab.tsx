import { FC } from 'react';
import styles from './index.module.css';
import {
  focusAreas,
  groupedDepartments,
  strengthsList,
  weaknessesList,
} from 'constants/persona';
import { InputType } from 'models/enums/inputType';
import { Persona, RoleLevel } from 'models/interfaces/persona';
import { LabelInput } from '../../../shared/LabelInput/LabelInput';

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
      <div className={styles.row}>
        <LabelInput
          inputType={InputType.Text}
          label="Role"
          value={editedPersona.role}
          onChange={(val: any) => onChangePersona('role', val)}
        />
        <LabelInput
          inputType={InputType.Select}
          label="Level"
          value={editedPersona.level}
          options={Object.values(RoleLevel).map((level) => ({
            label: level,
            value: level,
          }))}
          onChange={(val: any) => onChangePersona('level', val)}
          width={'200px'}
        />
      </div>
      <div className={styles.row}>
        <LabelInput
          inputType={InputType.Select}
          label="Department"
          value={editedPersona.department}
          options={groupedDepartments.flatMap((group) =>
            group.options.map((option) => ({
              label: option,
              value: option,
              group: group.label,
            })),
          )}
          onChange={(val: any) => onChangePersona('department', val)}
        />
        <LabelInput
          inputType={InputType.Text}
          label="Team"
          value={editedPersona.team}
          onChange={(val: any) => onChangePersona('team', val)}
        />
      </div>
      <LabelInput
        inputType={InputType.Tags}
        label="Focus areas"
        value={editedPersona.focusAreas}
        options={focusAreas.map((focus) => ({ label: focus, value: focus }))}
        onChange={(val: any) => onChangePersona('focusAreas', val)}
      />
      <div className={styles.row}>
        <LabelInput
          inputType={InputType.Tags}
          label="Strengths"
          value={editedPersona.strengths}
          options={strengthsList.map((item) => ({ label: item, value: item }))}
          onChange={(val: any) => onChangePersona('strengths', val)}
        />
        <LabelInput
          inputType={InputType.Tags}
          label="Weaknesses"
          value={editedPersona.weaknesses}
          options={weaknessesList.map((item) => ({ label: item, value: item }))}
          onChange={(val: any) => onChangePersona('weaknesses', val)}
        />
      </div>
      <LabelInput
        inputType={InputType.TextArea}
        label="Goals"
        value={editedPersona.goals}
        onChange={(val: any) => onChangePersona('goals', val)}
      />
    </div>
  );
};
