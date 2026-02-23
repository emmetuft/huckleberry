import { FC, useMemo, useRef } from 'react';
import styles from './IntentInput.module.scss';
import { MCPToolDefinition } from 'models/interfaces/mcpServer';

interface ToolPopupProps {
  popupRef: React.RefObject<HTMLDivElement>;
  tools: MCPToolDefinition[];
  selectedIndex: number;
  onSelectTool: (tool: MCPToolDefinition) => void;
}

export const ToolPopup: FC<ToolPopupProps> = ({
  popupRef,
  tools,
  selectedIndex,
  onSelectTool,
}) => {
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Group tools by server
  const groupedTools = useMemo(() => {
    const grouped: Record<string, MCPToolDefinition[]> = {};

    for (const tool of tools) {
      const serverKey = tool.serverName || tool.serverId;
      if (!grouped[serverKey]) {
        grouped[serverKey] = [];
      }
      grouped[serverKey].push(tool);
    }

    return grouped;
  }, [tools]);

  // Flatten tools for indexing
  const flatTools = useMemo(() => {
    return Object.values(groupedTools).flat();
  }, [groupedTools]);

  return (
    <div ref={popupRef} className={styles.toolPopup}>
      <div className={styles.toolList}>
        {Object.entries(groupedTools).map(([serverName, serverTools]) => (
          <div key={serverName} className={styles.serverGroup}>
            <div className={styles.serverName}>{serverName}</div>
            {serverTools.map((tool) => {
              const toolIndex = flatTools.findIndex(
                (t) => t.name === tool.name && t.serverId === tool.serverId,
              );
              const isSelected = toolIndex === selectedIndex;

              return (
                <div
                  key={`${tool.serverId}-${tool.name}`}
                  ref={isSelected ? selectedItemRef : null}
                  className={`${styles.toolItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => onSelectTool(tool)}
                >
                  <span className={styles.toolName}>{tool.name}</span>
                  {tool.description && (
                    <span className={styles.toolDescription}>
                      {tool.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.hint}>
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
        <span>Esc Cancel</span>
      </div>
    </div>
  );
};
