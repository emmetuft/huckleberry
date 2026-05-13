import { FC, useState } from 'react';

import { Checkbox, Input, Select, Tag } from 'antd';
import { InputType } from 'models/enums/inputType';
import styles from './LabelInput.module.css';

export interface FieldOption {
  label: string;
  value: string;
  description?: string;
  group?: string;
  selected?: boolean;
}

export interface InputField<K extends string = string> {
  key: K;
  label: string;
  inputType: InputType;
  placeholder?: string;
  halfWidth?: boolean;
  options?: FieldOption[];
}

const toSelectOptions = (options: FieldOption[]) => {
  const hasGroups = options.some((o) => o.group);
  if (!hasGroups) return options.map(({ label, value }) => ({ label, value }));

  const grouped: Record<string, { label: string; value: string }[]> = {};
  for (const { label, value, group } of options) {
    const key = group ?? '';
    (grouped[key] ??= []).push({ label, value });
  }
  return Object.entries(grouped).map(([label, opts]) => ({
    label,
    options: opts,
  }));
};

const FreeformTagInput: FC<{
  value: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}> = ({ value = [], onChange, placeholder }) => {
  const [inputVal, setInputVal] = useState('');

  const add = () => {
    const trimmed = inputVal.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange?.([...value, trimmed]);
    setInputVal('');
  };

  return (
    <div className={styles.freeformTags}>
      <Input
        value={inputVal}
        placeholder={placeholder}
        onChange={(e) => setInputVal(e.target.value)}
        onPressEnter={add}
      />
      {value.length > 0 && (
        <div className={styles.tagList}>
          {value.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => onChange?.(value.filter((t) => t !== tag))}
            >
              {tag}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

interface LabelInputProps {
  inputType: InputType;
  label: string;
  value: any;
  width?: number | string;
  options?: FieldOption[];
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (value: any) => void;
}

export const LabelInput: FC<LabelInputProps> = ({
  inputType,
  label,
  value,
  width,
  options,
  placeholder,
  readOnly,
  onChange,
}) => {
  const showLabel = inputType !== InputType.Checkbox;

  const renderInput = () => {
    if (readOnly) {
      return <span>{String(value)}</span>;
    }

    switch (inputType) {
      case InputType.Checkbox:
        return (
          <Checkbox checked={value} onChange={onChange}>
            {label}
          </Checkbox>
        );
      case InputType.Select:
        return (
          <Select
            value={value || undefined}
            options={options ? (toSelectOptions(options) as any) : undefined}
            placeholder={placeholder}
            onChange={onChange}
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
          />
        );
      case InputType.Tags:
        if (!options?.length) {
          return (
            <FreeformTagInput
              value={value}
              onChange={onChange}
              placeholder={placeholder}
            />
          );
        }
        return (
          <Select
            mode="tags"
            value={value}
            options={options}
            placeholder={placeholder}
            onChange={onChange}
            style={{ width: '100%' }}
          />
        );
      case InputType.RadioCards: {
        const effectiveValue = value || options?.find((o) => o.selected)?.value;
        return (
          <div className={styles.radioCards}>
            {options?.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.radioCard} ${effectiveValue === opt.value ? styles.selected : ''}`}
                onClick={() => onChange?.(opt.value)}
              >
                <span className={styles.radioCardLabel}>{opt.label}</span>
                {opt.description && (
                  <span className={styles.radioCardDesc}>
                    {opt.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        );
      }
      case InputType.Text:
        return (
          <Input
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );
      case InputType.TextArea:
        return (
          <Input.TextArea
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: width }}>
      {showLabel && <p>{label}</p>}
      {renderInput()}
    </div>
  );
};
