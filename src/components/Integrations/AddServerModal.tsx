import { FC, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { useAppDispatch } from 'reducers';
import { addServer, editServer } from 'reducers/mcp/actions';
import {
  MCPServerConfig,
  MCPServerCreateInput,
  MCPAuthType,
  MCPTransportType,
} from '../../../shared/models/interfaces/mcpServer';

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
      };

      if (isEditing && server) {
        await dispatch(
          editServer({
            id: server.id,
            input: {
              ...input,
              // Only include authToken if it was changed
              authToken: values.authToken || undefined,
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

        {authType && authType !== 'none' && (
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

        <Form.Item name="enabled" label="Enabled" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
