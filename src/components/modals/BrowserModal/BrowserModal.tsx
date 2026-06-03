import { ReactNode, useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import styles from './BrowserModal.module.css';

interface BrowserModalProps<T> {
  open: boolean;
  title: string;
  /** Singular noun used in the selected-count label, e.g. "datasource" or "tool". */
  itemLabel: string;
  onCancel: () => void;
  onConfirm: (items: T[]) => void;
  /** Renders the browser, wired to the modal's local selection state. */
  children: (selected: T[], onChange: (items: T[]) => void) => ReactNode;
}

export function BrowserModal<T>({
  open,
  title,
  itemLabel,
  onCancel,
  onConfirm,
  children,
}: BrowserModalProps<T>) {
  const [selected, setSelected] = useState<T[]>([]);

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelected([]);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(selected);
    setSelected([]);
  };

  const handleCancel = () => {
    setSelected([]);
    onCancel();
  };

  const footer = (
    <div className={styles.footer}>
      <span className={styles.selectedCount}>
        {selected.length > 0 &&
          `${selected.length} ${itemLabel}${selected.length !== 1 ? 's' : ''} selected`}
      </span>
      <div>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          type="primary"
          onClick={handleConfirm}
          disabled={selected.length === 0}
        >
          Add Selected
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={footer}
      destroyOnHidden
    >
      {children(selected, setSelected)}
    </Modal>
  );
}
