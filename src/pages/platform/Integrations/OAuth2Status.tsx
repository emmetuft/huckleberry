import { FC, useEffect } from 'react';
import { Button, Tag, Tooltip, Space } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  SyncOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'reducers';
import {
  initiateOAuth2Authorization,
  revokeOAuth2Authorization,
  fetchOAuth2Status,
  fetchServers,
  triggerOAuth2Discovery,
} from 'reducers/mcp/actions';
import {
  selectAuthorizingServerId,
  selectOAuth2Status,
  selectDiscoveringServerId,
} from 'reducers/mcp/slice';
import {
  MCPServerConfig,
  OAuth2AuthStatus,
} from '../../../../shared/models/interfaces/mcpServer';

interface OAuth2StatusProps {
  server: MCPServerConfig;
}

export const OAuth2Status: FC<OAuth2StatusProps> = ({ server }) => {
  const dispatch = useAppDispatch();
  const authorizingServerId = useSelector(selectAuthorizingServerId);
  const discoveringServerId = useSelector(selectDiscoveringServerId);
  const oauth2StatusMap = useSelector(selectOAuth2Status);

  const isAuthorizing = authorizingServerId === server.id;
  const isDiscovering = discoveringServerId === server.id;
  const statusData = oauth2StatusMap[server.id];
  const status: OAuth2AuthStatus =
    statusData?.status || server.oauth2Status || 'not_configured';

  // Check if we have discovered config
  const hasDiscoveredConfig =
    !!server.oauth2DiscoveredConfig?.authorizationEndpoint;
  const scopesSupported = server.oauth2DiscoveredConfig?.scopesSupported || [];

  useEffect(() => {
    if (server.authType === 'oauth2') {
      dispatch(fetchOAuth2Status(server.id));
    }
  }, [dispatch, server.id, server.authType]);

  const handleDiscover = async () => {
    try {
      await dispatch(triggerOAuth2Discovery(server.id)).unwrap();
      dispatch(fetchServers());
    } catch (error) {
      console.error('Failed to discover OAuth2:', error);
    }
  };

  const handleAuthorize = async () => {
    try {
      // If we don't have discovered config yet, trigger discovery first
      if (!hasDiscoveredConfig) {
        await handleDiscover();
      }

      const result = await dispatch(
        initiateOAuth2Authorization(server.id),
      ).unwrap();
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(
        result.authorizationUrl,
        'oauth2-popup',
        `width=${width},height=${height},left=${left},top=${top},popup=yes`,
      );
    } catch (error) {
      console.error('Failed to initiate OAuth2:', error);
    }
  };

  const handleRevoke = async () => {
    try {
      await dispatch(revokeOAuth2Authorization(server.id)).unwrap();
      dispatch(fetchServers());
    } catch (error) {
      console.error('Failed to revoke OAuth2:', error);
    }
  };

  const getStatusTag = () => {
    switch (status) {
      case 'authorized':
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Authorized
          </Tag>
        );
      case 'discovering':
        return (
          <Tag icon={<SyncOutlined spin />} color="processing">
            Discovering...
          </Tag>
        );
      case 'discovery_failed':
        return (
          <Tooltip
            title={
              server.oauth2Error || statusData?.error || 'Discovery failed'
            }
          >
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              Discovery Failed
            </Tag>
          </Tooltip>
        );
      case 'pending':
        return (
          <Tooltip
            title={
              scopesSupported.length > 0
                ? `Scopes: ${scopesSupported.join(', ')}`
                : undefined
            }
          >
            <Tag icon={<ClockCircleOutlined />} color="processing">
              Ready to Authorize
            </Tag>
          </Tooltip>
        );
      case 'expired':
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="warning">
            Expired
          </Tag>
        );
      case 'error':
        return (
          <Tooltip title={server.oauth2Error || statusData?.error}>
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              Error
            </Tag>
          </Tooltip>
        );
      default:
        return (
          <Tag icon={<LockOutlined />} color="default">
            Not Discovered
          </Tag>
        );
    }
  };

  if (server.authType !== 'oauth2') {
    return null;
  }

  const renderActions = () => {
    if (status === 'authorized') {
      return (
        <Button
          size="small"
          icon={<UnlockOutlined />}
          onClick={handleRevoke}
          danger
        >
          Revoke
        </Button>
      );
    }

    if (status === 'discovering') {
      return (
        <Button size="small" loading disabled>
          Discovering...
        </Button>
      );
    }

    // For not_configured or discovery_failed, show Discover button
    if (status === 'not_configured' || status === 'discovery_failed') {
      return (
        <Button
          size="small"
          icon={<SearchOutlined />}
          onClick={handleDiscover}
          loading={isDiscovering}
        >
          Discover
        </Button>
      );
    }

    // For pending/expired/error states, show Authorize button
    return (
      <Button
        size="small"
        type="primary"
        icon={<LockOutlined />}
        onClick={handleAuthorize}
        loading={isAuthorizing}
        disabled={!hasDiscoveredConfig && !server.oauth2Config}
      >
        Authorize
      </Button>
    );
  };

  return (
    <Space size="small" onClick={(e) => e.stopPropagation()}>
      {getStatusTag()}
      {renderActions()}
    </Space>
  );
};
