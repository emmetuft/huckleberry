import { FC, useEffect } from 'react';
import { Select } from 'antd';
import styles from './IntentInput.module.scss';
import { mcpTools } from 'constants/app';

interface ToolPopupProps {
  popupRef: React.RefObject<HTMLDivElement>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onPopupKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelectTool: (value: string) => void;
}

export const ToolPopup: FC<ToolPopupProps> = ({
  popupRef,
  inputRef,
  onPopupKeyDown,
  onSelectTool,
}) => {
  useEffect(() => {
    if (popupRef.current) {
      // Find the actual input inside the Antd Select
      const input = popupRef.current?.querySelector('input');
      if (input) {
        if (inputRef) {
          inputRef.current = input;
        }
        input.focus(); // or anything else
      }
    }
  }, []);

  return (
    <div ref={popupRef} className={styles.toolPopup}>
      <Select
        showSearch
        variant="filled"
        placeholder="Select a tool"
        options={mcpTools.map((tool) => ({
          value: tool,
          label: tool,
        }))}
        style={{ width: 300 }}
        filterOption={(input, option) =>
          (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
        }
        onInputKeyDown={onPopupKeyDown}
        onSelect={onSelectTool}
      />
    </div>
  );
};
