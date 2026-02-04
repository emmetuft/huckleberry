import { FC, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message, Typography } from 'antd';
import { useAppDispatch } from 'reducers';
import { addServer, editServer } from 'reducers/mcp/actions';
import {
  MCPServerConfig,
  MCPServerCreateInput,
  MCPAuthType,
  MCPTransportType,
  OAuth2DiscoveredConfig,
} from '../../../shared/models/interfaces/mcpServer';

const { Text } = Typography;

interface AddServerModalProps {
  open: boolean;
  server: MCPServerConfig | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddServerModal: FC<AddServerModalProps> = ({
  open,
  server,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const isEditing = !!server;

  useEffect(() => {
    if (open) {
      if (server) {
        form.setFieldsValue({
          name: server.name,
          description: server.description || '',
          url: server.url,
          transport: server.transport,
          authType: server.authType,
          authHeader: server.authHeader || '',
          authToken: '', // Don't pre-fill token for security
          enabled: server.enabled,
          // OAuth2 fields - simplified to just optional client credentials
          oauth2ClientId:
            server.oauth2DiscoveredConfig?.clientId ||
            server.oauth2Config?.clientId ||
            '',
          oauth2ClientSecret: '', // Don't pre-fill secret for security
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          transport: 'http',
          authType: 'none',
          enabled: true,
        });
      }
    }
  }, [open, server, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const input: MCPServerCreateInput = {
        name: values.name,
        description: values.description || undefined,
        url: values.url,
        transport: values.transport as MCPTransportType,
        authType: values.authType as MCPAuthType,
        authHeader: values.authHeader || undefined,
        authToken: values.authToken || undefined,
        enabled: values.enabled,
        // For OAuth2, only pass optional client credentials
        // The rest will be auto-discovered
        oauth2ClientId:
          values.authType === 'oauth2'
            ? values.oauth2ClientId || undefined
            : undefined,
        oauth2ClientSecret:
          values.authType === 'oauth2'
            ? values.oauth2ClientSecret || undefined
            : undefined,
      };

      if (isEditing && server) {
        // Build updated OAuth2 discovered config if needed
        let oauth2DiscoveredConfig: OAuth2DiscoveredConfig | undefined =
          undefined;
        if (
          values.authType === 'oauth2' &&
          (values.oauth2ClientId ||
            values.oauth2ClientSecret ||
            server.oauth2DiscoveredConfig)
        ) {
          oauth2DiscoveredConfig = {
            authorizationServers:
              server.oauth2DiscoveredConfig?.authorizationServers || [],
            scopesSupported:
              server.oauth2DiscoveredConfig?.scopesSupported || [],
            resourceMetadataUrl:
              server.oauth2DiscoveredConfig?.resourceMetadataUrl,
            authorizationEndpoint:
              server.oauth2DiscoveredConfig?.authorizationEndpoint,
            tokenEndpoint: server.oauth2DiscoveredConfig?.tokenEndpoint,
            registrationEndpoint:
              server.oauth2DiscoveredConfig?.registrationEndpoint,
            discoveredAt: server.oauth2DiscoveredConfig?.discoveredAt,
            clientId:
              values.oauth2ClientId || server.oauth2DiscoveredConfig?.clientId,
            clientSecret:
              values.oauth2ClientSecret ||
              server.oauth2DiscoveredConfig?.clientSecret,
          };
        }

        await dispatch(
          editServer({
            id: server.id,
            input: {
              ...input,
              // Only include authToken if it was changed
              authToken: values.authToken || undefined,
              oauth2DiscoveredConfig,
            },
          }),
        ).unwrap();
        message.success('Server updated');
      } else {
        await dispatch(addServer(input)).unwrap();
        message.success('Server added');
      }

      onSuccess();
    } catch (error: any) {
      if (error.message) {
        message.error(error.message);
      }
    }
  };

  const authType = Form.useWatch('authType', form);

  return (
    <Modal
      title={isEditing ? 'Edit MCP Server' : 'Add MCP Server'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText={isEditing ? 'Save' : 'Add'}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          transport: 'http',
          authType: 'none',
          enabled: true,
        }}
      >
        <Form.Item
          name="name"
          label="Server Name"
          rules={[{ required: true, message: 'Please enter a server name' }]}
        >
          <Input placeholder="My MCP Server" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Optional description of what this server provides"
            rows={2}
          />
        </Form.Item>

        <Form.Item
          name="url"
          label="Server URL"
          rules={[
            { required: true, message: 'Please enter the server URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
        >
          <Input placeholder="https://mcp-server.example.com/mcp" />
        </Form.Item>

        <Form.Item name="transport" label="Transport">
          <Select>
            <Select.Option value="http">HTTP</Select.Option>
            <Select.Option value="sse">Server-Sent Events (SSE)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="authType" label="Authentication">
          <Select>
            <Select.Option value="none">None</Select.Option>
            <Select.Option value="bearer">Bearer Token</Select.Option>
            <Select.Option value="api-key">API Key</Select.Option>
            <Select.Option value="oauth2">OAuth2</Select.Option>
          </Select>
        </Form.Item>

        {authType === 'api-key' && (
          <Form.Item
            name="authHeader"
            label="Header Name"
            tooltip="The HTTP header name to use for the API key"
          >
            <Input placeholder="X-API-Key" />
          </Form.Item>
        )}

        {authType && authType !== 'none' && authType !== 'oauth2' && (
          <Form.Item
            name="authToken"
            label={authType === 'bearer' ? 'Bearer Token' : 'API Key'}
            rules={
              isEditing
                ? []
                : [{ required: true, message: 'Please enter the token' }]
            }
          >
            <Input.Password
              placeholder={
                isEditing
                  ? 'Leave empty to keep existing token'
                  : 'Enter your token'
              }
            />
          </Form.Item>
        )}

        {authType === 'oauth2' && (
          <>
            <div
              style={{
                marginBottom: 16,
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                OAuth2 endpoints will be auto-discovered from the MCP server.
                Only provide client credentials if the authorization server
                doesn't support automatic client registration.
              </Text>
            </div>

            <Form.Item
              name="oauth2ClientId"
              label="Client ID"
              tooltip="Optional: Only required if the auth server doesn't support Dynamic Client Registration (DCR)"
            >
              <Input placeholder="Leave empty to use automatic registration" />
            </Form.Item>

            <Form.Item
              name="oauth2ClientSecret"
              label="Client Secret"
              tooltip="Optional: Only required for confidential clients"
            >
              <Input.Password
                placeholder={
                  isEditing
                    ? 'Leave empty to keep existing secret'
                    : 'Leave empty for public clients (PKCE)'
                }
              />
            </Form.Item>
          </>
        )}

        <Form.Item name="enabled" label="Enabled" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
