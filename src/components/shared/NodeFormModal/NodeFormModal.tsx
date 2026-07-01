import { FC, useEffect } from 'react';
import { Modal, Button } from 'antd';
import {
  InputField,
  LabelInput,
} from 'components/shared/LabelInput/LabelInput';
import { InputType } from 'models/enums/inputType';
import styles from './NodeFormModal.module.css';
import { useState } from 'react';

interface NodeFormModalProps {
  open: boolean;
  title: string;
  fields: InputField[];
  onCancel: () => void;
  onConfirm: (values: Record<string, unknown>) => void;
}

export const NodeFormModal: FC<NodeFormModalProps> = ({
  open,
  title,
  fields,
  onCancel,
  onConfirm,
}) => {
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open) setValues({});
  }, [open]);

  const getValue = (field: InputField) => {
    const v = values[field.key];
    if (v !== undefined && v !== '') return v;
    if (field.inputType === InputType.Tags) return [];
    if (field.inputType === InputType.RadioCards) {
      return (
        field.options?.find((o) => o.selected)?.value ??
        field.options?.[0]?.value ??
        ''
      );
    }
    return v ?? '';
  };

  const handleConfirm = () => {
    const resolved: Record<string, unknown> = {};
    for (const field of fields) {
      resolved[field.key] = getValue(field);
    }
    onConfirm(resolved);
  };

  const footer = (
    <div className={styles.footer}>
      <Button onClick={onCancel}>Cancel</Button>
      <Button type="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={footer}
      width={520}
      destroyOnHidden
    >
      <div className={styles.fields}>
        {fields.map((field) => (
          <div
            key={field.key}
            className={field.halfWidth ? styles.halfWidth : styles.fullWidth}
          >
            <LabelInput
              inputType={field.inputType}
              label={field.label}
              value={getValue(field)}
              options={field.options}
              description={field.description}
              onChange={(val) =>
                setValues((prev) => ({ ...prev, [field.key]: val }))
              }
              inputProps={field.inputProps}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};
