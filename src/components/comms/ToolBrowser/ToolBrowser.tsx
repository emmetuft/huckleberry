import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Input, Collapse, Button, Empty } from 'antd';
import { SearchOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './ToolBrowser.module.scss';
import { selectToolkits } from 'reducers/toolkits/slice';
import { Tool, Toolkit } from 'models/interfaces/toolkit';

interface ToolBrowserProps {
  open: boolean;
  onClose: () => void;
  selectedTools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
}

export const ToolBrowser: FC<ToolBrowserProps> = ({
  open,
  onClose,
  selectedTools,
  onToolsChange,
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
    onClose();
  };

  const collapseItems = filteredToolkits.map((toolkit) => ({
    key: toolkit.toolkitId,
    label: (
      <div className={styles.header}>
        <span className={styles.serverLabel}>{toolkit.name} </span>
        <span className={styles.toolCount}>{toolkit.tools.length} tools</span>
      </div>
    ),
    children: (
      <div className={styles.toolList}>
        {toolkit.tools.map((tool) => {
          const selected = isToolSelected(tool);
          return (
            <div key={tool.toolId} className={styles.toolItem}>
              <div className={styles.toolHeader}>
                <div className={styles.toolName}>{tool.overrideToolName}</div>
                <Button
                  type={selected ? 'primary' : 'default'}
                  size="small"
                  icon={selected ? <CheckOutlined /> : <PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTool(tool);
                  }}
                >
                  {selected ? 'Added' : 'Add'}
                </Button>
              </div>
              <div className={styles.toolDescription}>
                {tool.overrideToolDescription || 'No description'}
              </div>
            </div>
          );
        })}
      </div>
    ),
  }));

  return (
    <Modal
      className={styles.toolBrowserModal}
      title="Browse Tools"
      width={600}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <div className={styles.searchContainer}>
        <Input
          placeholder="Search tools..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />
      </div>

      {filteredToolkits.length === 0 ? (
        <Empty description={'No tools match your search'} />
      ) : (
        <Collapse items={collapseItems} className={styles.serverCollapse} />
      )}
    </Modal>
  );
};
