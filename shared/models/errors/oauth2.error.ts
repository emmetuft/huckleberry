import { OAuth2DiscoveredConfig } from '../interfaces/mcpServer.js';

/**
 * Error thrown when OAuth2 authorization is required
 * Contains the discovered config for the caller to handle
 */
export class OAuth2AuthorizationRequiredError extends Error {
  constructor(
    public serverId: string,
    public discoveredConfig: OAuth2DiscoveredConfig,
  ) {
    super('OAuth2 authorization required');
    this.name = 'OAuth2AuthorizationRequiredError';
  }
}
