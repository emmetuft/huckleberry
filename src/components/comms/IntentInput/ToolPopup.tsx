import { FC, useEffect, useMemo } from 'react';
import { Select } from 'antd';
import styles from './IntentInput.module.scss';
import { MCPToolDefinition } from '../../../../shared/models/interfaces/mcpServer';

interface ToolPopupProps {
  popupRef: React.RefObject<HTMLDivElement>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  tools: MCPToolDefinition[];
  onPopupKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelectTool: (tool: MCPToolDefinition) => void;
}

export const ToolPopup: FC<ToolPopupProps> = ({
  popupRef,
  inputRef,
  tools,
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
        input.focus();
      }
    }
  }, []);

  // Group tools by server and create select options
  const selectOptions = useMemo(() => {
    const grouped: Record<string, MCPToolDefinition[]> = {};

    for (const tool of tools) {
      const serverKey = tool.serverName || tool.serverId;
      if (!grouped[serverKey]) {
        grouped[serverKey] = [];
      }
      grouped[serverKey].push(tool);
    }

    return Object.entries(grouped).map(([serverName, serverTools]) => ({
      label: serverName,
      options: serverTools.map((tool) => ({
        value: `${tool.serverId}::${tool.name}`,
        label: tool.name,
        tool,
      })),
    }));
  }, [tools]);

  const handleSelect = (value: string, option: any) => {
    if (option.tool) {
      onSelectTool(option.tool);
    }
  };

  return (
    <div ref={popupRef} className={styles.toolPopup}>
      <Select
        showSearch
        variant="filled"
        placeholder={tools.length > 0 ? 'Select a tool' : 'No tools available'}
        options={selectOptions}
        style={{ width: 300 }}
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        onInputKeyDown={onPopupKeyDown}
        onSelect={handleSelect}
        disabled={tools.length === 0}
      />
    </div>
  );
};
