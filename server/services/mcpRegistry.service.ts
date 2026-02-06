import dotenv from 'dotenv';
import {
  MCPServerConfig,
  MCPServerCreateInput,
  MCPServerUpdateInput,
  MCPToolDefinition,
  MCPConnectionStatus,
} from '../../shared/models/interfaces/mcpServer.js';
import { extractAppDbData } from '../utils/appdb.js';

dotenv.config();

const BASE_URL = process.env.DOMO_INSTANCE_URL || 'https://domo-es.domo.com';
const COLLECTION_ID = '96bfadf7-9c4e-4cdb-91bb-808b05edd3db';
const DEVELOPER_TOKEN = process.env.DEV_TOKEN;

/**
 * MCP Registry Service
 * Handles MCP server configuration storage in Domo AppDB
 */
class MCPRegistryService {
  private serverCache: Map<string, MCPServerConfig>;
  private baseUrl: string;
  private collectionId: string;
  private headers: Record<string, string>;

  constructor() {
    this.serverCache = new Map();
    this.baseUrl = BASE_URL;
    this.collectionId = COLLECTION_ID;
    this.headers = {
      'X-DOMO-Developer-Token': DEVELOPER_TOKEN || '',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a new MCP server configuration
   */
  async createServer(input: MCPServerCreateInput): Promise<MCPServerConfig> {
    const now = new Date().toISOString();

    const serverConfig: Omit<MCPServerConfig, 'id'> = {
      name: input.name,
      description: input.description,
      url: input.url,
      transport: input.transport || 'http',
      authType: input.authType || 'none',
      authHeader: input.authHeader,
      authToken: input.authToken,
      enabled: input.enabled !== false,
      createdAt: now,
      connectionStatus: 'unknown',
      tools: [],
      // Legacy OAuth2 config (deprecated)
      oauth2Config: input.oauth2Config,
      // For OAuth2, initialize discovered config with user-provided client credentials if any
      oauth2DiscoveredConfig: input.authType === 'oauth2' && (input.oauth2ClientId || input.oauth2ClientSecret)
        ? {
            authorizationServers: [],
            scopesSupported: [],
            clientId: input.oauth2ClientId,
            clientSecret: input.oauth2ClientSecret,
          }
        : undefined,
      oauth2Status: input.authType === 'oauth2' ? 'not_configured' : undefined,
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ content: serverConfig }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `AppDB create failed: ${response.status} ${response.statusText}`,
        );
      }

      const document = await response.json();
      const servers = extractAppDbData<MCPServerConfig>(document);
      const server = servers[0];

      // Cache the result
      this.serverCache.set(server.id, server);

      return server;
    } catch (error) {
      console.error('Error creating MCP server:', error);
      throw error;
    }
  }

  /**
   * Get a server by ID
   */
  async getServerById(id: string): Promise<MCPServerConfig | null> {
    // Check cache first
    const cached = this.serverCache.get(id);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/${id}`,
        {
          method: 'GET',
          headers: this.headers,
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(
          `AppDB get failed: ${response.status} ${response.statusText}`,
        );
      }

      const document = await response.json();
      const servers = extractAppDbData<MCPServerConfig>(document);

      if (servers.length > 0) {
        const server = servers[0];
        this.serverCache.set(server.id, server);
        return server;
      }

      return null;
    } catch (error) {
      console.error('Error getting MCP server:', error);
      return null;
    }
  }

  /**
   * Get all servers
   */
  async getAllServers(): Promise<MCPServerConfig[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents`,
        {
          method: 'GET',
          headers: this.headers,
        },
      );

      if (!response.ok) {
        throw new Error(
          `AppDB list failed: ${response.status} ${response.statusText}`,
        );
      }

      const documents = await response.json();
      const servers = extractAppDbData<MCPServerConfig>(documents);

      // Update cache
      for (const server of servers) {
        this.serverCache.set(server.id, server);
      }

      return servers;
    } catch (error) {
      console.error('Error listing MCP servers:', error);
      return [];
    }
  }

  /**
   * Get only enabled servers
   */
  async getEnabledServers(): Promise<MCPServerConfig[]> {
    const allServers = await this.getAllServers();
    return allServers.filter((s) => s.enabled);
  }

  /**
   * Update a server configuration
   */
  async updateServer(
    id: string,
    input: MCPServerUpdateInput,
  ): Promise<MCPServerConfig | null> {
    const existing = await this.getServerById(id);
    if (!existing) {
      return null;
    }

    const updated: MCPServerConfig = {
      ...existing,
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Remove id from content (it's stored separately by AppDB)
    const { id: _id, ...content } = updated;

    try {
      const response = await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/${id}`,
        {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `AppDB update failed: ${response.status} ${response.statusText}`,
        );
      }

      const document = await response.json();
      const servers = extractAppDbData<MCPServerConfig>(document);
      const server = servers[0];

      // Update cache
      this.serverCache.set(server.id, server);

      return server;
    } catch (error) {
      console.error('Error updating MCP server:', error);
      throw error;
    }
  }

  /**
   * Delete a server
   */
  async deleteServer(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/${id}`,
        {
          method: 'DELETE',
          headers: this.headers,
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(
          `AppDB delete failed: ${response.status} ${response.statusText}`,
        );
      }

      // Remove from cache
      this.serverCache.delete(id);

      return true;
    } catch (error) {
      console.error('Error deleting MCP server:', error);
      return false;
    }
  }

  /**
   * Toggle server enabled state
   */
  async toggleServerEnabled(
    id: string,
    enabled: boolean,
  ): Promise<MCPServerConfig | null> {
    return this.updateServer(id, { enabled });
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(
    id: string,
    status: MCPConnectionStatus,
    lastConnectedAt?: string,
  ): Promise<void> {
    const update: MCPServerUpdateInput = {
      enabled: undefined, // Keep existing
    };

    const existing = await this.getServerById(id);
    if (!existing) return;

    const updated: MCPServerConfig = {
      ...existing,
      connectionStatus: status,
      lastConnectedAt: lastConnectedAt || existing.lastConnectedAt,
      updatedAt: new Date().toISOString(),
    };

    const { id: _id, ...content } = updated;

    try {
      await fetch(
        `${this.baseUrl}/api/datastores/v2/collections/${this.collectionId}/documents/${id}`,
        {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify({ content }),
        },
      );

      // Update cache
      this.serverCache.set(id, updated);
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  }

  /**
   * Get tools for a specific server
   */
  async getToolsByServerId(serverId: string): Promise<MCPToolDefinition[]> {
    const server = await this.getServerById(serverId);
    return server?.tools || [];
  }

  /**
   * Get all tools from all enabled servers
   */
  async getAllTools(): Promise<MCPToolDefinition[]> {
    const enabledServers = await this.getEnabledServers();
    const allTools: MCPToolDefinition[] = [];

    for (const server of enabledServers) {
      if (server.tools) {
        for (const tool of server.tools) {
          allTools.push({
            ...tool,
            serverId: server.id,
            serverName: server.name,
          });
        }
      }
    }

    return allTools;
  }

  /**
   * Sync tools for a server (replace all tools)
   */
  async syncTools(serverId: string, tools: MCPToolDefinition[]): Promise<void> {
    const server = await this.getServerById(serverId);
    if (!server) return;

    // Ensure each tool has the correct serverId
    const toolsWithServerId = tools.map((t) => ({
      ...t,
      serverId,
    }));

    await this.updateServer(serverId, {
      ...server,
      tools: toolsWithServerId,
    } as MCPServerUpdateInput);
  }

  /**
   * Clear tools for a server
   */
  async clearToolsForServer(serverId: string): Promise<void> {
    await this.syncTools(serverId, []);
  }

  /**
   * Invalidate cache for a server
   */
  invalidateCache(serverId: string): void {
    this.serverCache.delete(serverId);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.serverCache.clear();
  }

  /**
   * Close (no-op for AppDB, kept for interface compatibility)
   */
  close(): void {
    this.clearCache();
  }
}

export const mcpRegistryService = new MCPRegistryService();
