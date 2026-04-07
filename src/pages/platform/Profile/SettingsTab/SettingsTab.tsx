import { FC } from 'react';
import styles from './SettingsTab.module.css';
import { InputType } from 'models/enums/inputType';
import { LabelInput } from 'components/shared/LabelInput/LabelInput';

export const SettingsTab: FC = () => {
  const userSettings = {
    usePersona: true,
    useActivity: false,
    useData: true,
  };

  const onChangeSetting = (field: string, value: string) => {
    // TODO: Update settings
  };

  return (
    <div className={styles.tab}>
      <LabelInput
        inputType={InputType.Checkbox}
        label="Use my persona for tailored recommendations"
        value={userSettings.usePersona}
        onChange={(val: any) => onChangeSetting('usePersona', val)}
      />
      <LabelInput
        inputType={InputType.Checkbox}
        label="Use my activity history (recent projects, queries)"
        value={userSettings.useActivity}
        onChange={(val: any) => onChangeSetting('useActivity', val)}
      />
      <LabelInput
        inputType={InputType.Checkbox}
        label="Use data context (sources queried, files uploaded)"
        value={userSettings.useData}
        onChange={(val: any) => onChangeSetting('useData', val)}
      />
    </div>
  );
};
