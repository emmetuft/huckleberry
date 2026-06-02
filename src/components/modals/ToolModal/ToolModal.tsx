import { FC } from 'react';
import { Modal } from 'antd';
import { Tool } from 'models/interfaces/toolkit';
import { ToolBrowser } from 'components/shared/ToolBrowser/ToolBrowser';

interface ToolModalProps {
  open: boolean;
  onClose: () => void;
  selectedTools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
}

export const ToolModal: FC<ToolModalProps> = ({
  open,
  onClose,
  selectedTools,
  onToolsChange,
}) => {
  return (
    <Modal
      title="Browse Tools"
      width={600}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <ToolBrowser
        selectedTools={selectedTools}
        onToolsChange={onToolsChange}
      />
    </Modal>
  );
};
