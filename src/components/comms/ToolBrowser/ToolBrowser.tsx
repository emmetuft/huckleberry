import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Input, Collapse, Button, Empty } from 'antd';
import { SearchOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './ToolBrowser.module.scss';
import { useAppDispatch } from 'reducers';
import { fetchTools, fetchServers } from 'reducers/mcp/actions';
import { selectTools, selectServers } from 'reducers/mcp/slice';
import { MCPToolDefinition } from 'models/interfaces/mcpServer';

interface ToolBrowserProps {
  open: boolean;
  onClose: () => void;
  selectedTools: MCPToolDefinition[];
  onToolsChange: (tools: MCPToolDefinition[]) => void;
}

export const ToolBrowser: FC<ToolBrowserProps> = ({
  open,
  onClose,
  selectedTools,
  onToolsChange,
}) => {
  const dispatch = useAppDispatch();
  const tools = useSelector(selectTools);
  const servers = useSelector(selectServers);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      dispatch(fetchTools());
      dispatch(fetchServers());
    }
  }, [open, dispatch]);

  const toolsByServer = useMemo(() => {
    const grouped: Record<
      string,
      { serverName: string; tools: MCPToolDefinition[] }
    > = {};

    for (const tool of tools) {
      if (!grouped[tool.serverId]) {
        const server = servers.find((s) => s.id === tool.serverId);
        grouped[tool.serverId] = {
          serverName: server?.name || tool.serverName || 'Unknown Server',
          tools: [],
        };
      }
      grouped[tool.serverId].tools.push(tool);
    }

    return grouped;
  }, [tools, servers]);

  const filteredToolsByServer = useMemo(() => {
    if (!searchQuery) return toolsByServer;

    const query = searchQuery.toLowerCase();
    const filtered: typeof toolsByServer = {};

    for (const [serverId, { serverName, tools: serverTools }] of Object.entries(
      toolsByServer,
    )) {
      const matchingTools = serverTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query),
      );
      if (matchingTools.length > 0) {
        filtered[serverId] = { serverName, tools: matchingTools };
      }
    }

    return filtered;
  }, [toolsByServer, searchQuery]);

  const isToolSelected = (tool: MCPToolDefinition) =>
    selectedTools.some(
      (t) => t.name === tool.name && t.serverId === tool.serverId,
    );

  const handleToggleTool = (tool: MCPToolDefinition) => {
    if (isToolSelected(tool)) {
      onToolsChange(
        selectedTools.filter(
          (t) => !(t.name === tool.name && t.serverId === tool.serverId),
        ),
      );
    } else {
      onToolsChange([...selectedTools, tool]);
    }
    onClose();
  };

  const collapseItems = Object.entries(filteredToolsByServer).map(
    ([serverId, { serverName, tools: serverTools }]) => ({
      key: serverId,
      label: (
        <div className={styles.header}>
          <span className={styles.serverLabel}>{serverName} </span>
          <span className={styles.toolCount}>{serverTools.length} tools</span>
        </div>
      ),
      children: (
        <div className={styles.toolList}>
          {serverTools.map((tool) => {
            const selected = isToolSelected(tool);
            return (
              <div
                key={`${tool.serverId}-${tool.name}`}
                className={styles.toolItem}
              >
                <div className={styles.toolHeader}>
                  <div className={styles.toolName}>{tool.name}</div>
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
                  {tool.description || 'No description'}
                </div>
              </div>
            );
          })}
        </div>
      ),
    }),
  );

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

      {Object.keys(filteredToolsByServer).length === 0 ? (
        <Empty
          description={
            tools.length === 0
              ? 'No MCP servers connected. Add servers in Integrations.'
              : 'No tools match your search'
          }
        />
      ) : (
        <Collapse
          items={collapseItems}
          defaultActiveKey={Object.keys(filteredToolsByServer)}
          className={styles.serverCollapse}
        />
      )}
    </Modal>
  );
};
