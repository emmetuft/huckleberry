import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, Collapse, Button, Empty, Tag } from 'antd';
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import styles from './ToolBrowser.module.css';
import { selectToolkits } from 'reducers/toolkits/slice';
import { Tool, Toolkit } from 'models/interfaces/toolkit';

interface ToolBrowserProps {
  selectedTools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
  height?: number;
}

export const ToolBrowser: FC<ToolBrowserProps> = ({
  selectedTools,
  onToolsChange,
  height,
}) => {
  const toolkits = useSelector(selectToolkits);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredToolkits = useMemo(() => {
    if (!searchQuery) return toolkits;

    const query = searchQuery.toLowerCase();
    const filtered: Toolkit[] = [];

    toolkits.forEach((toolkit) => {
      const matchingTools = toolkit.tools.filter(
        (tool) =>
          tool.overrideToolName &&
          tool.overrideToolName.toLowerCase().includes(query),
      );

      if (matchingTools.length > 0) {
        filtered.push({
          ...toolkit,
          tools: matchingTools,
        });
      }
    });

    return filtered;
  }, [toolkits, searchQuery]);

  const isToolSelected = (tool: Tool) =>
    selectedTools.some((t) => t.toolId === tool.toolId);

  const handleToggleTool = (tool: Tool) => {
    if (isToolSelected(tool)) {
      onToolsChange(selectedTools.filter((t) => !(t.toolId === tool.toolId)));
    } else {
      onToolsChange([...selectedTools, tool]);
    }
  };

  const collapseItems = filteredToolkits.map((toolkit) => ({
    key: toolkit.toolkitId,
    label: (
      <div className={styles.header}>
        <span className={styles.serverLabel}>{toolkit.name} </span>
        <span className={styles.toolCount}>
          {toolkit.tools.length} tool{toolkit.tools.length !== 1 ? 's' : ''}
        </span>
      </div>
    ),
    children: (
      <div className={styles.toolList}>
        {toolkit.tools.map((tool) => {
          const selected = isToolSelected(tool);
          return (
            <div key={tool.toolId} className="appCard">
              <div className={`defaultAppIcon ${styles.toolIcon}`}>
                <WrenchIcon />
              </div>
              <div className="appInfo">
                <h4>{tool.overrideToolName || 'No title'}</h4>
                <p title={tool.overrideToolDescription}>
                  {tool.overrideToolDescription || 'No description'}
                </p>
              </div>
              <div className={styles.connectAction}>
                <Button
                  size="small"
                  type={selected ? 'primary' : 'default'}
                  icon={selected ? <CheckIcon /> : <PlusIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTool(tool);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    ),
  }));

  return (
    <div className={styles.toolBrowser}>
      <Input
        placeholder="Search tools..."
        prefix={<MagnifyingGlassIcon />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        allowClear
      />

      {selectedTools.length > 0 && (
        <div className={styles.selectedList}>
          {selectedTools.map((tool) => (
            <Tag
              key={tool.toolId}
              closable
              onClose={() => handleToggleTool(tool)}
            >
              {tool.overrideToolName || 'No title'}
            </Tag>
          ))}
        </div>
      )}

      {filteredToolkits.length === 0 ? (
        <Empty description={'No tools match your search'} />
      ) : (
        <Collapse
          items={collapseItems}
          className={styles.serverCollapse}
          style={{ maxHeight: height ?? 600 }}
        />
      )}
    </div>
  );
};
