import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, Collapse, Button, Empty, Tag, Spin } from 'antd';
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ToolboxIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import styles from './ToolBrowser.module.css';
import { selectToolkits, selectLoading } from 'reducers/toolkits/slice';
import { Tool } from 'models/interfaces/toolkit';

interface ToolModeProps {
  mode?: 'tool';
  selectedTools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
  selectedToolkitIds?: never;
  onToolkitIdsChange?: never;
}

interface ToolkitModeProps {
  mode: 'toolkit';
  selectedToolkitIds: string[];
  onToolkitIdsChange: (ids: string[]) => void;
  selectedTools?: never;
  onToolsChange?: never;
}

type ToolBrowserProps = (ToolModeProps | ToolkitModeProps) & {
  height?: number;
};

export const ToolBrowser: FC<ToolBrowserProps> = (props) => {
  const { mode = 'tool', height } = props;
  const toolkits = useSelector(selectToolkits);
  const loading = useSelector(selectLoading);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredToolkits = useMemo(() => {
    if (!searchQuery) return toolkits;
    const query = searchQuery.toLowerCase();

    if (mode === 'toolkit') {
      return toolkits.filter(
        (tk) =>
          tk.name.toLowerCase().includes(query) ||
          tk.description?.toLowerCase().includes(query),
      );
    }

    return toolkits
      .map((toolkit) => ({
        ...toolkit,
        tools: toolkit.tools.filter(
          (tool) =>
            tool.overrideToolName?.toLowerCase().includes(query) ||
            tool.overrideToolDescription?.toLowerCase().includes(query),
        ),
      }))
      .filter((tk) => tk.tools.length > 0);
  }, [toolkits, searchQuery, mode]);

  const isToolSelected = (tool: Tool) =>
    mode !== 'toolkit' &&
    (props as ToolModeProps).selectedTools.some(
      (t) => t.toolId === tool.toolId,
    );

  const handleToggleTool = (tool: Tool) => {
    if (mode === 'toolkit') return;
    const { selectedTools, onToolsChange } = props as ToolModeProps;
    if (isToolSelected(tool)) {
      onToolsChange(selectedTools.filter((t) => t.toolId !== tool.toolId));
    } else {
      onToolsChange([...selectedTools, tool]);
    }
  };

  const isToolkitSelected = (toolkitId: string) =>
    mode === 'toolkit' &&
    (props as ToolkitModeProps).selectedToolkitIds.includes(toolkitId);

  const handleToggleToolkit = (toolkitId: string) => {
    if (mode !== 'toolkit') return;
    const { selectedToolkitIds, onToolkitIdsChange } =
      props as ToolkitModeProps;
    if (isToolkitSelected(toolkitId)) {
      onToolkitIdsChange(selectedToolkitIds.filter((id) => id !== toolkitId));
    } else {
      onToolkitIdsChange([...selectedToolkitIds, toolkitId]);
    }
  };

  if (loading) {
    return (
      <div className={styles.toolBrowser}>
        <Spin size="small" />
      </div>
    );
  }

  if (mode === 'toolkit') {
    const { selectedToolkitIds } = props as ToolkitModeProps;
    return (
      <div className={styles.toolBrowser}>
        <Input
          placeholder="Search toolkits..."
          prefix={<MagnifyingGlassIcon />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />

        {selectedToolkitIds.length > 0 && (
          <div className={styles.selectedList}>
            {selectedToolkitIds.map((id) => {
              const tk = toolkits.find((t) => t.toolkitId === id);
              return (
                <Tag key={id} closable onClose={() => handleToggleToolkit(id)}>
                  {tk?.name ?? id}
                </Tag>
              );
            })}
          </div>
        )}

        {filteredToolkits.length === 0 ? (
          <Empty description="No toolkits found" />
        ) : (
          <div className={styles.toolList} style={{ maxHeight: height ?? 400 }}>
            {filteredToolkits.map((toolkit) => {
              const selected = isToolkitSelected(toolkit.toolkitId);
              return (
                <div key={toolkit.toolkitId} className="appCard">
                  <div className={`defaultAppIcon ${styles.toolIcon}`}>
                    <ToolboxIcon />
                  </div>
                  <div className="appInfo">
                    <h4>{toolkit.name}</h4>
                    <p title={toolkit.description}>
                      {toolkit.description || 'No description'}
                    </p>
                  </div>
                  <div className={styles.connectAction}>
                    <Button
                      size="small"
                      type={selected ? 'primary' : 'default'}
                      icon={selected ? <CheckIcon /> : <PlusIcon />}
                      onClick={() => handleToggleToolkit(toolkit.toolkitId)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const { selectedTools } = props as ToolModeProps;

  const collapseItems = filteredToolkits.map((toolkit) => ({
    key: toolkit.toolkitId,
    label: (
      <div className={styles.header}>
        <span className={styles.serverLabel}>{toolkit.name}</span>
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
        <Empty description="No tools match your search" />
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
