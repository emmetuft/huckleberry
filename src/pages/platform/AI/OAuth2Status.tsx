import { FC, useEffect } from 'react';
import { Button, Tag, Space } from 'antd';
import {
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  ClockIcon,
  LockIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useAppDispatch } from 'reducers';
import { MCPServerConfig, OAuth2AuthStatus } from 'models/interfaces/mcpServer';
import AppTooltip from 'components/shared/Tooltip';

interface OAuth2StatusProps {
  server: MCPServerConfig;
}

export const OAuth2Status: FC<OAuth2StatusProps> = ({ server }) => {
  const dispatch = useAppDispatch();
  const authorizingServerId = null;
  const discoveringServerId = null;
  const oauth2StatusMap: any = {};

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
      // dispatch(fetchOAuth2Status(server.id));
    }
  }, [dispatch, server.id, server.authType]);

  const handleDiscover = async () => {
    // try {
    //   await dispatch(triggerOAuth2Discovery(server.id)).unwrap();
    //   dispatch(fetchServers());
    // } catch (error) {
    //   console.error('Failed to discover OAuth2:', error);
    // }
  };

  const handleAuthorize = async () => {
    // try {
    //   // If we don't have discovered config yet, trigger discovery first
    //   if (!hasDiscoveredConfig) {
    //     await handleDiscover();
    //   }
    //   const result = await dispatch(
    //     initiateOAuth2Authorization(server.id),
    //   ).unwrap();
    //   // Open OAuth popup
    //   const width = 600;
    //   const height = 700;
    //   const left = window.screenX + (window.outerWidth - width) / 2;
    //   const top = window.screenY + (window.outerHeight - height) / 2;
    //   window.open(
    //     result.authorizationUrl,
    //     'oauth2-popup',
    //     `width=${width},height=${height},left=${left},top=${top},popup=yes`,
    //   );
    // } catch (error) {
    //   console.error('Failed to initiate OAuth2:', error);
    // }
  };

  const handleRevoke = async () => {
    // try {
    //   await dispatch(revokeOAuth2Authorization(server.id)).unwrap();
    //   dispatch(fetchServers());
    // } catch (error) {
    //   console.error('Failed to revoke OAuth2:', error);
    // }
  };

  const getStatusTag = () => {
    switch (status) {
      case 'authorized':
        return (
          <Tag icon={<CheckCircleIcon />} color="success">
            Authorized
          </Tag>
        );
      case 'discovering':
        return (
          <Tag icon={<ArrowsClockwiseIcon />} color="processing">
            Discovering...
          </Tag>
        );
      case 'discovery_failed':
        return (
          <AppTooltip
            title={
              server.oauth2Error || statusData?.error || 'Discovery failed'
            }
          >
            <Tag icon={<WarningCircleIcon />} color="error">
              Discovery Failed
            </Tag>
          </AppTooltip>
        );
      case 'pending':
        return (
          <AppTooltip
            title={
              scopesSupported.length > 0
                ? `Scopes: ${scopesSupported.join(', ')}`
                : undefined
            }
          >
            <Tag icon={<ClockIcon />} color="processing">
              Ready to Authorize
            </Tag>
          </AppTooltip>
        );
      case 'expired':
        return (
          <Tag icon={<WarningCircleIcon />} color="warning">
            Expired
          </Tag>
        );
      case 'error':
        return (
          <AppTooltip title={server.oauth2Error || statusData?.error}>
            <Tag icon={<WarningCircleIcon />} color="error">
              Error
            </Tag>
          </AppTooltip>
        );
      default:
        return (
          <Tag icon={<LockIcon />} color="default">
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
          icon={<LockOpenIcon />}
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
          icon={<MagnifyingGlassIcon />}
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
        icon={<LockIcon />}
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
