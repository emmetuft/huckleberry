import { FC } from 'react';
import { Checkbox, Input, Select } from 'antd';
import styles from './PersonaModal.module.scss';
import { InputType } from 'models/enums/inputType';

interface LabelInputProps {
  inputType: InputType;
  label: string;
  value: any;
  options?: any[];
  onChange?: (value: any) => void;
}

export const LabelInput: FC<LabelInputProps> = ({
  inputType,
  label,
  value,
  onChange,
  options,
}) => {
  const showLabel = inputType !== InputType.Checkbox;

  const renderInput = () => {
    switch (inputType) {
      case InputType.Checkbox:
        return (
          <Checkbox checked={value} onChange={onChange}>
            {label}
          </Checkbox>
        );
      case InputType.Select:
        return <Select value={value} options={options} onChange={onChange} />;
      case InputType.Tags:
        return (
          <Select
            mode="tags"
            value={value}
            options={options}
            onChange={onChange}
          />
        );
      case InputType.Text:
        return (
          <Input value={value} onChange={(e) => onChange?.(e.target.value)} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.labelInput}>
      {showLabel && <p className={styles.label}>{label}</p>}
      {renderInput()}
    </div>
  );
};
