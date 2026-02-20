import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Button,
  Menu,
  MenuProps,
  Tabs,
  Popconfirm,
  Switch,
  message,
} from 'antd';
import { PlusOutlined, SyncOutlined, ApiOutlined } from '@ant-design/icons';
import styles from './Integrations.module.scss';
import { integrationCategories, integrationList } from 'constants/integrations';
import { defaultMotionProps } from 'constants/styles';
import { IntegrationCard } from './IntegrationCard';
import { AddServerModal } from './AddServerModal';
import { OAuth2Status } from './OAuth2Status';
import { useAppDispatch } from 'reducers';
import {
  fetchServers,
  fetchTools,
  removeServer,
  testConnection,
  syncTools,
  toggleServerEnabled,
  editServer,
} from 'reducers/mcp/actions';
import {
  selectServers,
  selectSelectedServerId,
  selectSelectedServer,
  selectTestingServerId,
  selectSyncingServerId,
  setSelectedServer,
} from 'reducers/mcp/slice';
import { MCPServerConfig } from '../../../../shared/models/interfaces/mcpServer';

type MenuItem = Required<MenuProps>['items'][number];

interface IntegrationsProps {}

export const Integrations: FC<IntegrationsProps> = () => {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServerConfig | null>(
    null,
  );

  const servers = useSelector(selectServers);
  const selectedServerId = useSelector(selectSelectedServerId);
  const selectedServer = useSelector(selectSelectedServer);
  const testingServerId = useSelector(selectTestingServerId);
  const syncingServerId = useSelector(selectSyncingServerId);

  useEffect(() => {
    dispatch(fetchServers());
    dispatch(fetchTools());
  }, [dispatch]);

  // Handle OAuth2 callback URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get('oauth_success');
    const oauthError = params.get('oauth_error');

    if (oauthSuccess === 'true') {
      message.success('OAuth2 authorization successful');
      dispatch(fetchServers());
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauthError) {
      message.error(`OAuth2 error: ${oauthError}`);
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [dispatch]);

  const filteredIntegrations = useMemo(
    () =>
      integrationList.filter((integration) => {
        if (!selectedCategory) return !integration.connected;
        return (
          integration.category === selectedCategory && !integration.connected
        );
      }),
    [selectedCategory],
  );

  const onClickCategory: MenuProps['onClick'] = (e) => {
    const category = e.key === selectedCategory ? null : e.key;
    setSelectedCategory(category);
  };

  const items: MenuItem[] = [
    {
      key: 'categories',
      label: 'Categories',
      type: 'group',
      children: integrationCategories.map((category) => ({
        key: category,
        label: category,
      })),
    },
  ];

  const handleAddServer = () => {
    setEditingServer(null);
    setAddModalOpen(true);
  };

  const handleEditServer = (server: MCPServerConfig) => {
    setEditingServer(server);
    setAddModalOpen(true);
  };

  const handleDeleteServer = async (id: string) => {
    await dispatch(removeServer(id));
    message.success('Server deleted');
  };

  const handleTestConnection = async (id: string) => {
    const result = await dispatch(testConnection(id)).unwrap();
    if (result.success) {
      message.success(
        `Connected: ${result.tools?.length || 0} tools available`,
      );
    } else if (result.requiresOAuth2 && result.oauth2DiscoveredConfig) {
      // OAuth2 required - update server with discovered config
      const server = servers.find((s) => s.id === id);
      if (server) {
        await dispatch(
          editServer({
            id,
            input: {
              oauth2DiscoveredConfig: result.oauth2DiscoveredConfig,
              oauth2Status: 'pending',
            },
          }),
        );
        dispatch(fetchServers());
        message.info(
          'OAuth2 authorization required. Click "Authorize" to connect.',
        );
      }
    } else {
      message.error(`Connection failed: ${result.message}`);
    }
  };

  const handleSyncTools = async (id: string) => {
    try {
      const result = await dispatch(syncTools(id)).unwrap();
      message.success(`Synced ${result.toolCount} tools`);
      dispatch(fetchTools());
    } catch (error) {
      message.error('Failed to sync tools');
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    await dispatch(toggleServerEnabled({ id, enabled }));
    dispatch(fetchTools());
  };

  const handleServerClick = (server: MCPServerConfig) => {
    dispatch(
      setSelectedServer(server.id === selectedServerId ? null : server.id),
    );
  };

  const handleModalClose = () => {
    setAddModalOpen(false);
    setEditingServer(null);
  };

  const handleModalSuccess = () => {
    dispatch(fetchServers());
    dispatch(fetchTools());
    handleModalClose();
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const renderMCPServers = () => (
    <div className={styles.mcpSection}>
      <div className={styles.sectionHeader}>
        <h2>MCP Servers</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddServer}
        >
          Add Server
        </Button>
      </div>

      {servers.length === 0 ? (
        <div className={styles.emptyState}>
          <ApiOutlined
            style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }}
          />
          <h3>No MCP Servers Connected</h3>
          <p>Connect external MCP servers to use their tools in chat.</p>
          <Button type="primary" onClick={handleAddServer}>
            Add Your First Server
          </Button>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.right} style={{ flex: 2 }}>
            <div className={styles.serverGrid}>
              {servers.map((server) => (
                <div
                  key={server.id}
                  className={`${styles.serverCard} ${
                    selectedServerId === server.id ? styles.selected : ''
                  }`}
                  onClick={() => handleServerClick(server)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.serverInfo}>
                      <h3>{server.name}</h3>
                      <div className={styles.serverUrl}>{server.url}</div>
                    </div>
                    <div className={styles.statusBadge}>
                      <span
                        className={`${styles.statusDot} ${
                          styles[server.connectionStatus || 'unknown']
                        }`}
                      />
                      {getStatusText(server.connectionStatus)}
                    </div>
                  </div>

                  {server.description && (
                    <div className={styles.cardDescription}>
                      {server.description}
                    </div>
                  )}

                  <div className={styles.toolCount}>
                    {server.tools?.length || 0} tools available
                  </div>

                  {server.authType === 'oauth2' && (
                    <div className={styles.oauth2Status}>
                      <OAuth2Status server={server} />
                    </div>
                  )}

                  <div
                    className={styles.cardActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={server.enabled}
                      onChange={(checked) =>
                        handleToggleEnabled(server.id, checked)
                      }
                      size="small"
                    />
                    <Button
                      size="small"
                      onClick={() => handleTestConnection(server.id)}
                      loading={testingServerId === server.id}
                    >
                      Test
                    </Button>
                    <Button
                      size="small"
                      icon={<SyncOutlined />}
                      onClick={() => handleSyncTools(server.id)}
                      loading={syncingServerId === server.id}
                    >
                      Sync
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleEditServer(server)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this server?"
                      onConfirm={() => handleDeleteServer(server.id)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <Button size="small" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedServer && (
            <div className={styles.left} style={{ flex: 1 }}>
              <div className={styles.selectedServerPanel}>
                <h3>Tools from {selectedServer.name}</h3>
                {selectedServer.tools && selectedServer.tools.length > 0 ? (
                  <div className={styles.toolsList}>
                    {selectedServer.tools.map((tool) => (
                      <div key={tool.name} className={styles.toolItem}>
                        <div className={styles.toolName}>{tool.name}</div>
                        <div className={styles.toolDescription}>
                          {tool.description || 'No description'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noTools}>
                    No tools discovered. Try syncing the server.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'mcp',
      label: 'MCP Servers',
      children: renderMCPServers(),
    },
    {
      key: 'integrations',
      label: 'Data Integrations',
      children: (
        <div className={styles.tabContent}>
          <motion.div {...defaultMotionProps}>
            <div>
              <h2>Connected</h2>
              <div className={styles.integrationGrid}>
                {integrationList
                  .filter((integration) => integration.connected)
                  .map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                    />
                  ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...defaultMotionProps}>
            <div>
              <h2>Available</h2>
              <div className={styles.layout}>
                <div className={styles.left}>
                  <Menu
                    selectedKeys={selectedCategory ? [selectedCategory] : []}
                    onClick={onClickCategory}
                    mode="inline"
                    items={items}
                  />
                </div>
                <div className={styles.right}>
                  <div
                    className={`${styles.integrationGrid} ${styles.available}`}
                  >
                    {filteredIntegrations.map((integration) => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        showAddBtn
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.Integrations}>
      <Tabs items={tabItems} defaultActiveKey="mcp" />
      <AddServerModal
        open={addModalOpen}
        server={editingServer}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
