import { Request, Response } from 'express';
import { oauth2Service } from '../services/oauth2.service.js';
import { mcpRegistryService } from '../services/mcpRegistry.service.js';
import { removeMCPClient } from '../services/mcpHttpClient.js';
import { OAuth2DiscoveredConfig } from '../../shared/models/interfaces/mcpServer.js';

/**
 * POST /api/mcp/oauth2/discover/:serverId
 * Trigger OAuth2 discovery for an MCP server
 */
export async function discoverOAuth2(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { serverId } = req.params;

    const server = await mcpRegistryService.getServerById(serverId);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    // Update status to discovering
    await mcpRegistryService.updateServer(serverId, {
      oauth2Status: 'discovering',
    });

    try {
      // Perform discovery
      const discoveredConfig = await oauth2Service.discoverOAuth2Config(server.url);

      // Preserve any user-provided client credentials
      if (server.oauth2DiscoveredConfig?.clientId) {
        discoveredConfig.clientId = server.oauth2DiscoveredConfig.clientId;
      }
      if (server.oauth2DiscoveredConfig?.clientSecret) {
        discoveredConfig.clientSecret = server.oauth2DiscoveredConfig.clientSecret;
      }

      // Update server with discovered config
      await mcpRegistryService.updateServer(serverId, {
        oauth2DiscoveredConfig: discoveredConfig,
        oauth2Status: 'pending', // Ready for authorization
        oauth2Error: undefined,
      });

      res.json({
        success: true,
        data: {
          discoveredConfig,
          message: 'OAuth2 endpoints discovered successfully',
        },
      });
    } catch (discoveryError) {
      // Update status to discovery_failed
      await mcpRegistryService.updateServer(serverId, {
        oauth2Status: 'discovery_failed',
        oauth2Error: discoveryError instanceof Error ? discoveryError.message : 'Discovery failed',
      });

      res.status(400).json({
        success: false,
        error: discoveryError instanceof Error ? discoveryError.message : 'Discovery failed',
      });
    }
  } catch (error) {
    console.error('Error in OAuth2 discovery:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/mcp/oauth2/authorize/:serverId
 * Initiate OAuth2 flow - returns authorization URL
 * Now supports both legacy config and discovered config
 */
export async function initiateAuthorization(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { serverId } = req.params;

    const server = await mcpRegistryService.getServerById(serverId);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    if (server.authType !== 'oauth2') {
      res.status(400).json({
        success: false,
        error: 'Server is not configured for OAuth2 authentication',
      });
      return;
    }

    // Get the base URL from the request for building callback URL
    const protocol = req.protocol;
    const host = req.get('host');
    const callbackBaseUrl = `${protocol}://${host}`;

    let authUrl: string;
    let state: string;

    // Prefer discovered config, fall back to legacy config
    if (server.oauth2DiscoveredConfig?.authorizationEndpoint) {
      // Check if we have a client ID (either from discovery or user-provided)
      if (!server.oauth2DiscoveredConfig.clientId) {
        // Try Dynamic Client Registration if available
        if (server.oauth2DiscoveredConfig.registrationEndpoint) {
          try {
            const redirectUri = `${callbackBaseUrl}/api/mcp/oauth2/callback`;
            const registration = await oauth2Service.registerClient(
              server.oauth2DiscoveredConfig.registrationEndpoint,
              redirectUri,
              server.name,
            );

            // Update config with registered client
            const updatedConfig: OAuth2DiscoveredConfig = {
              ...server.oauth2DiscoveredConfig,
              clientId: registration.client_id,
              clientSecret: registration.client_secret,
            };

            await mcpRegistryService.updateServer(serverId, {
              oauth2DiscoveredConfig: updatedConfig,
            });

            // Use updated config
            server.oauth2DiscoveredConfig = updatedConfig;
          } catch (dcrError) {
            res.status(400).json({
              success: false,
              error: `Client registration failed: ${dcrError instanceof Error ? dcrError.message : 'Unknown error'}. Please provide a client ID manually.`,
            });
            return;
          }
        } else {
          res.status(400).json({
            success: false,
            error: 'No client ID configured. Please provide a client ID in the server settings.',
          });
          return;
        }
      }

      const result = oauth2Service.buildAuthorizationUrlFromDiscoveredConfig(
        serverId,
        server.oauth2DiscoveredConfig,
        callbackBaseUrl,
      );
      authUrl = result.authUrl;
      state = result.state;
    } else if (server.oauth2Config) {
      // Legacy config
      const result = oauth2Service.buildAuthorizationUrl(
        serverId,
        server.oauth2Config,
        callbackBaseUrl,
      );
      authUrl = result.authUrl;
      state = result.state;
    } else {
      res.status(400).json({
        success: false,
        error: 'No OAuth2 configuration found. Please run discovery first.',
      });
      return;
    }

    // Update server status to pending
    await mcpRegistryService.updateServer(serverId, {
      oauth2Status: 'pending',
    });

    res.json({
      success: true,
      data: {
        authorizationUrl: authUrl,
        state,
      },
    });
  } catch (error) {
    console.error('Error initiating OAuth2 authorization:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/mcp/oauth2/callback
 * Handle OAuth2 callback from provider
 * Supports both legacy and discovered config
 */
export async function handleCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code, state, error: oauthError, error_description } = req.query;

    // Handle OAuth error response
    if (oauthError) {
      console.error('OAuth2 error:', oauthError, error_description);
      res.redirect(
        `/integrations?oauth_error=${encodeURIComponent(String(error_description || oauthError))}`,
      );
      return;
    }

    if (!code || !state) {
      res.redirect('/integrations?oauth_error=Missing+code+or+state+parameter');
      return;
    }

    // Verify and consume state
    const stateData = oauth2Service.verifyAndConsumeState(String(state));

    if (!stateData) {
      res.redirect('/integrations?oauth_error=Invalid+or+expired+state');
      return;
    }

    const { serverId, codeVerifier, redirectUri } = stateData;

    // Get server config
    const server = await mcpRegistryService.getServerById(serverId);

    if (!server) {
      res.redirect('/integrations?oauth_error=Server+configuration+not+found');
      return;
    }

    try {
      let tokenData;

      // Prefer discovered config, fall back to legacy config
      if (server.oauth2DiscoveredConfig?.tokenEndpoint && server.oauth2DiscoveredConfig?.clientId) {
        tokenData = await oauth2Service.exchangeCodeForTokensWithDiscoveredConfig(
          String(code),
          server.oauth2DiscoveredConfig,
          codeVerifier,
          redirectUri,
        );
      } else if (server.oauth2Config) {
        tokenData = await oauth2Service.exchangeCodeForTokens(
          String(code),
          server.oauth2Config,
          codeVerifier,
          redirectUri,
        );
      } else {
        res.redirect('/integrations?oauth_error=No+OAuth2+configuration+found');
        return;
      }

      // Store tokens
      await oauth2Service.storeTokens(serverId, tokenData);

      // Update server status
      await mcpRegistryService.updateServer(serverId, {
        oauth2Status: 'authorized',
        oauth2AuthorizedAt: new Date().toISOString(),
        oauth2Error: undefined,
      });

      // Clear client cache to force re-authentication
      removeMCPClient(serverId);

      // Redirect to integrations page with success
      res.redirect(`/integrations?oauth_success=true&server_id=${serverId}`);
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);

      // Update server status to error
      await mcpRegistryService.updateServer(serverId, {
        oauth2Status: 'error',
        oauth2Error:
          tokenError instanceof Error
            ? tokenError.message
            : 'Token exchange failed',
      });

      res.redirect('/integrations?oauth_error=Token+exchange+failed');
    }
  } catch (error) {
    console.error('Error handling OAuth2 callback:', error);
    res.redirect('/integrations?oauth_error=Callback+processing+failed');
  }
}

/**
 * POST /api/mcp/oauth2/revoke/:serverId
 * Revoke OAuth2 tokens for a server
 */
export async function revokeAuthorization(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { serverId } = req.params;

    const server = await mcpRegistryService.getServerById(serverId);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    // Delete stored tokens
    await oauth2Service.deleteTokens(serverId);

    // Update server status
    await mcpRegistryService.updateServer(serverId, {
      oauth2Status: 'not_configured',
      oauth2AuthorizedAt: undefined,
      oauth2Error: undefined,
    });

    // Clear client cache
    removeMCPClient(serverId);

    res.json({
      success: true,
      data: { revoked: true },
    });
  } catch (error) {
    console.error('Error revoking OAuth2 authorization:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/mcp/oauth2/status/:serverId
 * Get OAuth2 authorization status for a server
 */
export async function getAuthorizationStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { serverId } = req.params;

    const server = await mcpRegistryService.getServerById(serverId);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    // Use the stored status, or check token status
    let status = server.oauth2Status || 'not_configured';

    // If we have a status that indicates configuration but no tokens, verify
    if (status === 'authorized') {
      const tokenStatus = await oauth2Service.getAuthStatus(
        serverId,
        server.oauth2Config,
      );
      if (tokenStatus === 'not_configured' || tokenStatus === 'expired') {
        status = tokenStatus;
      }
    }

    res.json({
      success: true,
      data: {
        status,
        authorizedAt: server.oauth2AuthorizedAt,
        error: server.oauth2Error,
        discoveredConfig: server.oauth2DiscoveredConfig,
        hasClientId: !!(server.oauth2DiscoveredConfig?.clientId || server.oauth2Config?.clientId),
        scopesSupported: server.oauth2DiscoveredConfig?.scopesSupported || server.oauth2Config?.scopes || [],
      },
    });
  } catch (error) {
    console.error('Error getting OAuth2 status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
