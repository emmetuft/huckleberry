import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  OAuth2Config,
  OAuth2DiscoveredConfig,
  OAuth2TokenData,
  OAuth2AuthStatus,
} from '../../shared/models/interfaces/mcpServer.js';
import { extractAppDbData } from '../utils/appdb.js';

dotenv.config();

const BASE_URL = process.env.DOMO_INSTANCE_URL || 'https://domo-es.domo.com';
const OAUTH2_TOKENS_COLLECTION_ID = 'oauth2-tokens-collection';
const DEVELOPER_TOKEN = process.env.DEV_TOKEN;

interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

interface OAuthState {
  serverId: string;
  codeVerifier: string;
  createdAt: number;
  redirectUri: string;
}

interface StoredToken {
  id?: string;
  serverId: string;
  tokenData: OAuth2TokenData;
  createdAt: string;
  updatedAt: string;
}

/**
 * OAuth2 Service
 * Handles OAuth2 Authorization Code Flow with PKCE for MCP server authentication
 */
class OAuth2Service {
  private baseUrl: string;
  private collectionId: string;
  private headers: Record<string, string>;
  private pendingStates: Map<string, OAuthState>;
  private tokenCache: Map<string, OAuth2TokenData>;
  private readonly STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.baseUrl = BASE_URL;
    this.collectionId = OAUTH2_TOKENS_COLLECTION_ID;
    this.headers = {
      'X-DOMO-Developer-Token': DEVELOPER_TOKEN || '',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    this.pendingStates = new Map();
    this.tokenCache = new Map();
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  generatePKCE(): PKCEPair {
    // Generate a random code verifier (43-128 characters)
    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // Generate code challenge using S256 method
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hash.toString('base64url');

    return { codeVerifier, codeChallenge };
  }

  /**
   * Build the OAuth2 authorization URL with PKCE and state
   */
  buildAuthorizationUrl(
    serverId: string,
    oauth2Config: OAuth2Config,
    callbackBaseUrl: string,
  ): { authUrl: string; state: string } {
    const { codeVerifier, codeChallenge } = this.generatePKCE();
    const state = crypto.randomBytes(16).toString('hex');

    const redirectUri =
      oauth2Config.redirectUri || `${callbackBaseUrl}/api/mcp/oauth2/callback`;

    // Store state for verification
    this.pendingStates.set(state, {
      serverId,
      codeVerifier,
      createdAt: Date.now(),
      redirectUri,
    });

    // Clean up expired states
    this.cleanupExpiredStates();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauth2Config.clientId,
      redirect_uri: redirectUri,
      scope: oauth2Config.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${oauth2Config.authorizationUrl}?${params.toString()}`;

    return { authUrl, state };
  }

  /**
   * Verify and consume state parameter (CSRF protection)
   * Returns the stored state data and removes it from pending states
   */
  verifyAndConsumeState(state: string): OAuthState | null {
    const storedState = this.pendingStates.get(state);

    if (!storedState) {
      return null;
    }

    // Check if state has expired
    if (Date.now() - storedState.createdAt > this.STATE_EXPIRY_MS) {
      this.pendingStates.delete(state);
      return null;
    }

    // Consume the state (one-time use)
    this.pendingStates.delete(state);

    return storedState;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    oauth2Config: OAuth2Config,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<OAuth2TokenData> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: oauth2Config.clientId,
      code_verifier: codeVerifier,
    });

    // Include client_secret if provided (confidential clients)
    if (oauth2Config.clientSecret) {
      params.append('client_secret', oauth2Config.clientSecret);
    }

    const response = await fetch(oauth2Config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Token exchange failed:', response.status, errorBody);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokenResponse = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    const now = Date.now();
    const tokenData: OAuth2TokenData = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type || 'Bearer',
      issuedAt: now,
      expiresAt: tokenResponse.expires_in
        ? now + tokenResponse.expires_in * 1000
        : undefined,
    };

    return tokenData;
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(
    refreshToken: string,
    oauth2Config: OAuth2Config,
  ): Promise<OAuth2TokenData> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: oauth2Config.clientId,
    });

    if (oauth2Config.clientSecret) {
      params.append('client_secret', oauth2Config.clientSecret);
    }

    const response = await fetch(oauth2Config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Token refresh failed:', response.status, errorBody);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokenResponse = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    const now = Date.now();
    const tokenData: OAuth2TokenData = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || refreshToken, // Keep old refresh token if new one not provided
      tokenType: tokenResponse.token_type || 'Bearer',
      issuedAt: now,
      expiresAt: tokenResponse.expires_in
        ? now + tokenResponse.expires_in * 1000
        : undefined,
    };

    return tokenData;
  }

  /**
   * Store tokens in AppDB
   */
  async storeTokens(serverId: string, tokenData: OAuth2TokenData): Promise<void> {
    const now = new Date().toISOString();

    // Check if token document already exists for this server
    const existing = await this.getStoredTokenDocument(serverId);

    const content: Omit<StoredToken, 'id'> = {
      serverId,
      tokenData,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    try {
      if (existing?.id) {
        // Update existing document
        await fetch(
          `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/${existing.id}`,
          {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify({ content }),
          },
        );
      } else {
        // Create new document
        await fetch(
          `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents`,
          {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ content }),
          },
        );
      }

      // Update cache
      this.tokenCache.set(serverId, tokenData);
    } catch (error) {
      console.error('Error storing OAuth2 tokens:', error);
      throw error;
    }
  }

  /**
   * Get stored token document from AppDB
   */
  private async getStoredTokenDocument(
    serverId: string,
  ): Promise<StoredToken | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents?serverId=${serverId}`,
        {
          method: 'GET',
          headers: this.headers,
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        // Collection might not exist yet, return null
        return null;
      }

      const documents = (await response.json()) as
        | { id: string; content: Omit<StoredToken, 'id'> }[]
        | { id: string; content: Omit<StoredToken, 'id'> };
      const tokens = extractAppDbData<StoredToken>(documents);

      // Find the token for this serverId
      const token = tokens.find((t) => t.serverId === serverId);
      return token || null;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  }

  /**
   * Get tokens for a server
   */
  async getTokens(serverId: string): Promise<OAuth2TokenData | null> {
    // Check cache first
    const cached = this.tokenCache.get(serverId);
    if (cached) {
      return cached;
    }

    const stored = await this.getStoredTokenDocument(serverId);
    if (stored) {
      this.tokenCache.set(serverId, stored.tokenData);
      return stored.tokenData;
    }

    return null;
  }

  /**
   * Delete tokens for a server (revoke)
   */
  async deleteTokens(serverId: string): Promise<void> {
    const stored = await this.getStoredTokenDocument(serverId);

    if (stored?.id) {
      try {
        await fetch(
          `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/${stored.id}`,
          {
            method: 'DELETE',
            headers: this.headers,
          },
        );
      } catch (error) {
        console.error('Error deleting OAuth2 tokens:', error);
      }
    }

    // Clear from cache
    this.tokenCache.delete(serverId);
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(
    serverId: string,
    oauth2Config: OAuth2Config,
  ): Promise<string | null> {
    const tokenData = await this.getTokens(serverId);

    if (!tokenData) {
      return null;
    }

    // Check if token is expired (with 60 second buffer)
    const bufferMs = 60 * 1000;
    const isExpired =
      tokenData.expiresAt && Date.now() >= tokenData.expiresAt - bufferMs;

    if (isExpired && tokenData.refreshToken) {
      try {
        console.log(`[OAuth2] Refreshing expired token for server ${serverId}`);
        const newTokenData = await this.refreshAccessToken(
          tokenData.refreshToken,
          oauth2Config,
        );
        await this.storeTokens(serverId, newTokenData);
        return newTokenData.accessToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Token refresh failed, return null to trigger re-authorization
        return null;
      }
    }

    if (isExpired && !tokenData.refreshToken) {
      // No refresh token and access token expired
      return null;
    }

    return tokenData.accessToken;
  }

  /**
   * Check the authorization status for a server
   */
  async getAuthStatus(
    serverId: string,
    oauth2Config?: OAuth2Config,
  ): Promise<OAuth2AuthStatus> {
    if (!oauth2Config) {
      return 'not_configured';
    }

    const tokenData = await this.getTokens(serverId);

    if (!tokenData) {
      return 'not_configured';
    }

    // Check if token is expired
    if (tokenData.expiresAt && Date.now() >= tokenData.expiresAt) {
      if (tokenData.refreshToken) {
        // Has refresh token, can try to refresh
        return 'authorized';
      }
      return 'expired';
    }

    return 'authorized';
  }

  /**
   * Clean up expired states
   */
  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [state, data] of this.pendingStates.entries()) {
      if (now - data.createdAt > this.STATE_EXPIRY_MS) {
        this.pendingStates.delete(state);
      }
    }
  }

  /**
   * Invalidate token cache for a server
   */
  invalidateCache(serverId: string): void {
    this.tokenCache.delete(serverId);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.tokenCache.clear();
    this.pendingStates.clear();
  }

  // ============================================================
  // OAuth2 Discovery Methods (MCP Spec Compliant)
  // ============================================================

  /**
   * Parse WWW-Authenticate header to extract resource_metadata URL
   * Per MCP spec, the header format is: Bearer resource_metadata="<url>"
   */
  parseWWWAuthenticate(header: string): { resourceMetadataUrl?: string } {
    if (!header) {
      return {};
    }

    // Match resource_metadata="<url>" pattern
    const resourceMatch = header.match(/resource_metadata="([^"]+)"/);
    if (resourceMatch) {
      return { resourceMetadataUrl: resourceMatch[1] };
    }

    // Also try without quotes (some implementations)
    const unquotedMatch = header.match(/resource_metadata=(\S+)/);
    if (unquotedMatch) {
      return { resourceMetadataUrl: unquotedMatch[1] };
    }

    return {};
  }

  /**
   * Fetch Protected Resource Metadata from MCP server
   * Per RFC 9728: GET /.well-known/oauth-protected-resource
   */
  async discoverProtectedResourceMetadata(mcpServerUrl: string): Promise<{
    resource: string;
    authorization_servers: string[];
    scopes_supported?: string[];
  }> {
    // Construct the well-known URL from the MCP server URL
    const url = new URL(mcpServerUrl);
    const wellKnownUrl = `${url.origin}/.well-known/oauth-protected-resource`;

    console.log(`[OAuth2 Discovery] Fetching protected resource metadata from: ${wellKnownUrl}`);

    const response = await fetch(wellKnownUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch protected resource metadata: ${response.status}`);
    }

    const metadata = await response.json() as {
      resource: string;
      authorization_servers?: string[];
      scopes_supported?: string[];
    };

    console.log(`[OAuth2 Discovery] Protected resource metadata:`, metadata);

    if (!metadata.authorization_servers || metadata.authorization_servers.length === 0) {
      throw new Error('No authorization servers found in protected resource metadata');
    }

    return {
      resource: metadata.resource,
      authorization_servers: metadata.authorization_servers,
      scopes_supported: metadata.scopes_supported,
    };
  }

  /**
   * Fetch Authorization Server Metadata
   * Per RFC 8414: GET /.well-known/openid-configuration or /.well-known/oauth-authorization-server
   */
  async discoverAuthServerMetadata(authServerUrl: string): Promise<{
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    registration_endpoint?: string;
    scopes_supported?: string[];
  }> {
    const url = new URL(authServerUrl);

    // Try OpenID Connect discovery first, then OAuth2 authorization server metadata
    const discoveryUrls = [
      `${url.origin}/.well-known/openid-configuration`,
      `${url.origin}/.well-known/oauth-authorization-server`,
    ];

    let lastError: Error | null = null;

    for (const discoveryUrl of discoveryUrls) {
      console.log(`[OAuth2 Discovery] Trying auth server metadata at: ${discoveryUrl}`);

      try {
        const response = await fetch(discoveryUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const metadata = await response.json() as {
            issuer: string;
            authorization_endpoint: string;
            token_endpoint: string;
            registration_endpoint?: string;
            scopes_supported?: string[];
          };

          console.log(`[OAuth2 Discovery] Auth server metadata:`, metadata);

          if (!metadata.authorization_endpoint || !metadata.token_endpoint) {
            throw new Error('Invalid auth server metadata: missing required endpoints');
          }

          return metadata;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`[OAuth2 Discovery] Failed to fetch from ${discoveryUrl}:`, lastError.message);
      }
    }

    throw lastError || new Error('Failed to discover auth server metadata');
  }

  /**
   * Full OAuth2 discovery flow
   * 1. Fetch protected resource metadata from MCP server
   * 2. Fetch auth server metadata from the first authorization server
   */
  async discoverOAuth2Config(mcpServerUrl: string): Promise<OAuth2DiscoveredConfig> {
    console.log(`[OAuth2 Discovery] Starting discovery for: ${mcpServerUrl}`);

    // Step 1: Get protected resource metadata
    const resourceMetadata = await this.discoverProtectedResourceMetadata(mcpServerUrl);

    // Step 2: Get auth server metadata from the first authorization server
    const authServerUrl = resourceMetadata.authorization_servers[0];
    const authServerMetadata = await this.discoverAuthServerMetadata(authServerUrl);

    // Combine into discovered config
    const config: OAuth2DiscoveredConfig = {
      resourceMetadataUrl: `${new URL(mcpServerUrl).origin}/.well-known/oauth-protected-resource`,
      authorizationServers: resourceMetadata.authorization_servers,
      scopesSupported: resourceMetadata.scopes_supported || authServerMetadata.scopes_supported || [],
      authorizationEndpoint: authServerMetadata.authorization_endpoint,
      tokenEndpoint: authServerMetadata.token_endpoint,
      registrationEndpoint: authServerMetadata.registration_endpoint,
      discoveredAt: Date.now(),
    };

    console.log(`[OAuth2 Discovery] Discovery complete:`, config);

    return config;
  }

  /**
   * Try to discover OAuth2 config from a 401 response
   * Returns the discovered config if WWW-Authenticate header indicates OAuth2
   */
  async discoverFromWWWAuthenticate(
    mcpServerUrl: string,
    wwwAuthenticateHeader: string,
  ): Promise<OAuth2DiscoveredConfig | null> {
    const { resourceMetadataUrl } = this.parseWWWAuthenticate(wwwAuthenticateHeader);

    if (!resourceMetadataUrl) {
      // No resource_metadata in header, try direct discovery
      console.log('[OAuth2 Discovery] No resource_metadata in header, trying direct discovery');
      try {
        return await this.discoverOAuth2Config(mcpServerUrl);
      } catch (error) {
        console.log('[OAuth2 Discovery] Direct discovery failed:', error);
        return null;
      }
    }

    // Use the provided resource_metadata URL
    console.log(`[OAuth2 Discovery] Using resource_metadata URL from header: ${resourceMetadataUrl}`);

    try {
      const response = await fetch(resourceMetadataUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resource metadata: ${response.status}`);
      }

      const resourceMetadata = await response.json() as {
        resource: string;
        authorization_servers?: string[];
        scopes_supported?: string[];
      };

      if (!resourceMetadata.authorization_servers || resourceMetadata.authorization_servers.length === 0) {
        throw new Error('No authorization servers in resource metadata');
      }

      // Get auth server metadata
      const authServerMetadata = await this.discoverAuthServerMetadata(
        resourceMetadata.authorization_servers[0]
      );

      return {
        resourceMetadataUrl,
        authorizationServers: resourceMetadata.authorization_servers,
        scopesSupported: resourceMetadata.scopes_supported || authServerMetadata.scopes_supported || [],
        authorizationEndpoint: authServerMetadata.authorization_endpoint,
        tokenEndpoint: authServerMetadata.token_endpoint,
        registrationEndpoint: authServerMetadata.registration_endpoint,
        discoveredAt: Date.now(),
      };
    } catch (error) {
      console.error('[OAuth2 Discovery] Failed to discover from WWW-Authenticate:', error);
      return null;
    }
  }

  /**
   * Register client dynamically using RFC 7591 Dynamic Client Registration
   * Only works if the auth server has a registration_endpoint
   */
  async registerClient(
    registrationEndpoint: string,
    redirectUri: string,
    clientName?: string,
  ): Promise<{ client_id: string; client_secret?: string }> {
    console.log(`[OAuth2 DCR] Registering client at: ${registrationEndpoint}`);

    const registrationRequest = {
      redirect_uris: [redirectUri],
      client_name: clientName || 'Huckleberry MCP Client',
      token_endpoint_auth_method: 'none', // Public client using PKCE
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    };

    const response = await fetch(registrationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(registrationRequest),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[OAuth2 DCR] Registration failed:', response.status, errorBody);
      throw new Error(`Client registration failed: ${response.status}`);
    }

    const result = await response.json() as {
      client_id: string;
      client_secret?: string;
    };

    console.log(`[OAuth2 DCR] Client registered successfully: ${result.client_id}`);

    return result;
  }

  /**
   * Build authorization URL using discovered config
   */
  buildAuthorizationUrlFromDiscoveredConfig(
    serverId: string,
    discoveredConfig: OAuth2DiscoveredConfig,
    callbackBaseUrl: string,
  ): { authUrl: string; state: string } {
    if (!discoveredConfig.authorizationEndpoint) {
      throw new Error('Authorization endpoint not discovered');
    }

    if (!discoveredConfig.clientId) {
      throw new Error('Client ID not configured. Either provide a client ID or ensure the auth server supports Dynamic Client Registration.');
    }

    const { codeVerifier, codeChallenge } = this.generatePKCE();
    const state = crypto.randomBytes(16).toString('hex');

    const redirectUri = `${callbackBaseUrl}/api/mcp/oauth2/callback`;

    // Store state for verification
    this.pendingStates.set(state, {
      serverId,
      codeVerifier,
      createdAt: Date.now(),
      redirectUri,
    });

    // Clean up expired states
    this.cleanupExpiredStates();

    // Build scopes - use discovered scopes or empty string if none
    const scopes = discoveredConfig.scopesSupported?.length > 0
      ? discoveredConfig.scopesSupported.join(' ')
      : '';

    console.log(`[OAuth2] Building auth URL with scopes: "${scopes}"`);
    console.log(`[OAuth2] Discovered config:`, JSON.stringify(discoveredConfig, null, 2));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: discoveredConfig.clientId,
      redirect_uri: redirectUri,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // Only add scope if we have scopes
    if (scopes) {
      params.set('scope', scopes);
    }

    const authUrl = `${discoveredConfig.authorizationEndpoint}?${params.toString()}`;
    console.log(`[OAuth2] Auth URL: ${authUrl}`);

    return { authUrl, state };
  }

  /**
   * Exchange code for tokens using discovered config
   */
  async exchangeCodeForTokensWithDiscoveredConfig(
    code: string,
    discoveredConfig: OAuth2DiscoveredConfig,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<OAuth2TokenData> {
    if (!discoveredConfig.tokenEndpoint) {
      throw new Error('Token endpoint not discovered');
    }

    if (!discoveredConfig.clientId) {
      throw new Error('Client ID not configured');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: discoveredConfig.clientId,
      code_verifier: codeVerifier,
    });

    // Include client_secret if provided (confidential clients)
    if (discoveredConfig.clientSecret) {
      params.append('client_secret', discoveredConfig.clientSecret);
    }

    const response = await fetch(discoveredConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Token exchange failed:', response.status, errorBody);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokenResponse = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    const now = Date.now();
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type || 'Bearer',
      issuedAt: now,
      expiresAt: tokenResponse.expires_in
        ? now + tokenResponse.expires_in * 1000
        : undefined,
    };
  }

  /**
   * Refresh access token using discovered config
   */
  async refreshAccessTokenWithDiscoveredConfig(
    refreshToken: string,
    discoveredConfig: OAuth2DiscoveredConfig,
  ): Promise<OAuth2TokenData> {
    if (!discoveredConfig.tokenEndpoint) {
      throw new Error('Token endpoint not discovered');
    }

    if (!discoveredConfig.clientId) {
      throw new Error('Client ID not configured');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: discoveredConfig.clientId,
    });

    if (discoveredConfig.clientSecret) {
      params.append('client_secret', discoveredConfig.clientSecret);
    }

    const response = await fetch(discoveredConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Token refresh failed:', response.status, errorBody);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokenResponse = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    const now = Date.now();
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || refreshToken,
      tokenType: tokenResponse.token_type || 'Bearer',
      issuedAt: now,
      expiresAt: tokenResponse.expires_in
        ? now + tokenResponse.expires_in * 1000
        : undefined,
    };
  }

  /**
   * Get a valid access token using discovered config, refreshing if necessary
   */
  async getValidAccessTokenWithDiscoveredConfig(
    serverId: string,
    discoveredConfig: OAuth2DiscoveredConfig,
  ): Promise<string | null> {
    const tokenData = await this.getTokens(serverId);

    if (!tokenData) {
      return null;
    }

    // Check if token is expired (with 60 second buffer)
    const bufferMs = 60 * 1000;
    const isExpired =
      tokenData.expiresAt && Date.now() >= tokenData.expiresAt - bufferMs;

    if (isExpired && tokenData.refreshToken) {
      try {
        console.log(`[OAuth2] Refreshing expired token for server ${serverId}`);
        const newTokenData = await this.refreshAccessTokenWithDiscoveredConfig(
          tokenData.refreshToken,
          discoveredConfig,
        );
        await this.storeTokens(serverId, newTokenData);
        return newTokenData.accessToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }

    if (isExpired && !tokenData.refreshToken) {
      return null;
    }

    return tokenData.accessToken;
  }
}

export const oauth2Service = new OAuth2Service();
