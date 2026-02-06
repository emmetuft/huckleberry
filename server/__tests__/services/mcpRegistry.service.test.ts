import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCPServerCreateInput, MCPToolDefinition } from '../../../shared/models/interfaces/mcpServer.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking fetch
const { mcpRegistryService } = await import('../../services/mcpRegistry.service.js');

describe('MCPRegistryService', () => {
  const testServer: MCPServerCreateInput = {
    name: 'Test MCP Server',
    description: 'A test server',
    url: 'http://localhost:3001/mcp',
    transport: 'http',
    authType: 'bearer',
    authToken: 'test-token-123',
    enabled: true,
  };

  const mockServerResponse = {
    id: 'test-server-id',
    content: {
      name: 'Test MCP Server',
      description: 'A test server',
      url: 'http://localhost:3001/mcp',
      transport: 'http',
      authType: 'bearer',
      authToken: 'test-token-123',
      enabled: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      connectionStatus: 'unknown',
      tools: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mcpRegistryService.clearCache();
  });

  afterEach(() => {
    mcpRegistryService.clearCache();
  });

  describe('createServer', () => {
    it('should create a new MCP server config', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      const server = await mcpRegistryService.createServer(testServer);

      expect(server).toBeDefined();
      expect(server.id).toBe('test-server-id');
      expect(server.name).toBe(testServer.name);
      expect(server.description).toBe(testServer.description);
      expect(server.url).toBe(testServer.url);
      expect(server.transport).toBe(testServer.transport);
      expect(server.authType).toBe(testServer.authType);
      expect(server.enabled).toBe(true);
      expect(server.tools).toEqual([]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/documents'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        }),
      );
    });

    it('should handle create failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(mcpRegistryService.createServer(testServer)).rejects.toThrow(
        'AppDB create failed',
      );
    });

    it('should create a server without auth token when authType is none', async () => {
      const serverInput: MCPServerCreateInput = {
        ...testServer,
        authType: 'none',
        authToken: undefined,
      };

      const responseWithoutAuth = {
        ...mockServerResponse,
        content: {
          ...mockServerResponse.content,
          authType: 'none',
          authToken: undefined,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutAuth,
      });

      const server = await mcpRegistryService.createServer(serverInput);

      expect(server.authType).toBe('none');
      expect(server.authToken).toBeUndefined();
    });
  });

  describe('getServerById', () => {
    it('should return null for non-existent server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const server = await mcpRegistryService.getServerById('non-existent-id');
      expect(server).toBeNull();
    });

    it('should return server from cache if available', async () => {
      // First call to populate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      const server1 = await mcpRegistryService.getServerById('test-server-id');
      expect(server1).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const server2 = await mcpRegistryService.getServerById('test-server-id');
      expect(server2).toBeDefined();
      expect(server2!.id).toBe(server1!.id);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional fetch
    });

    it('should return server with tools', async () => {
      const responseWithTools = {
        ...mockServerResponse,
        content: {
          ...mockServerResponse.content,
          tools: [
            {
              name: 'testTool',
              description: 'A test tool',
              inputSchema: { type: 'object' },
              serverId: 'test-server-id',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithTools,
      });

      const server = await mcpRegistryService.getServerById('test-server-id');

      expect(server).toBeDefined();
      expect(server!.tools).toHaveLength(1);
      expect(server!.tools[0].name).toBe('testTool');
    });
  });

  describe('getAllServers', () => {
    it('should list all registered servers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockServerResponse],
      });

      const servers = await mcpRegistryService.getAllServers();

      expect(servers).toBeDefined();
      expect(servers.length).toBe(1);
      expect(servers[0].id).toBe('test-server-id');
    });

    it('should return empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const servers = await mcpRegistryService.getAllServers();
      expect(servers).toEqual([]);
    });
  });

  describe('getEnabledServers', () => {
    it('should only return enabled servers', async () => {
      const enabledServer = { ...mockServerResponse };
      const disabledServer = {
        ...mockServerResponse,
        id: 'disabled-server-id',
        content: {
          ...mockServerResponse.content,
          enabled: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [enabledServer, disabledServer],
      });

      const enabledServers = await mcpRegistryService.getEnabledServers();

      expect(enabledServers.every((s) => s.enabled)).toBe(true);
      expect(enabledServers.some((s) => s.id === 'disabled-server-id')).toBe(false);
    });
  });

  describe('updateServer', () => {
    it('should update server config', async () => {
      // Mock getServerById
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      // Mock update
      const updatedResponse = {
        ...mockServerResponse,
        content: {
          ...mockServerResponse.content,
          name: 'Updated Server Name',
          description: 'Updated description',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedResponse,
      });

      const updated = await mcpRegistryService.updateServer('test-server-id', {
        name: 'Updated Server Name',
        description: 'Updated description',
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Server Name');
      expect(updated!.description).toBe('Updated description');
      expect(updated!.url).toBe(testServer.url); // Unchanged
    });

    it('should return null for non-existent server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const updated = await mcpRegistryService.updateServer('non-existent', {
        name: 'Test',
      });
      expect(updated).toBeNull();
    });
  });

  describe('deleteServer', () => {
    it('should delete server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const deleted = await mcpRegistryService.deleteServer('test-server-id');
      expect(deleted).toBe(true);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/documents/test-server-id'),
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });

    it('should return false for non-existent server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const deleted = await mcpRegistryService.deleteServer('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('toggleServerEnabled', () => {
    it('should toggle server enabled/disabled', async () => {
      // Mock getServerById for update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      // Mock update
      const disabledResponse = {
        ...mockServerResponse,
        content: {
          ...mockServerResponse.content,
          enabled: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => disabledResponse,
      });

      const disabled = await mcpRegistryService.toggleServerEnabled(
        'test-server-id',
        false,
      );
      expect(disabled!.enabled).toBe(false);
    });
  });

  describe('syncTools', () => {
    it('should sync tools for a server', async () => {
      // Mock getServerById
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      const tools: MCPToolDefinition[] = [
        {
          name: 'queryDatabase',
          description: 'Execute SQL queries',
          inputSchema: { type: 'object' },
          serverId: 'test-server-id',
        },
        {
          name: 'listTables',
          description: 'List all tables',
          inputSchema: { type: 'object' },
          serverId: 'test-server-id',
        },
      ];

      const responseWithTools = {
        ...mockServerResponse,
        content: {
          ...mockServerResponse.content,
          tools,
        },
      };

      // Mock update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithTools,
      });

      await mcpRegistryService.syncTools('test-server-id', tools);

      // Verify updateServer was called with tools
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/documents/test-server-id'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('queryDatabase'),
        }),
      );
    });
  });

  describe('getAllTools', () => {
    it('should return tools from all enabled servers', async () => {
      const serverWithTools = {
        ...mockServerResponse,
        content: {
          ...mockServerResponse.content,
          tools: [
            {
              name: 'testTool',
              description: 'A test tool',
              inputSchema: { type: 'object' },
              serverId: 'test-server-id',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [serverWithTools],
      });

      const allTools = await mcpRegistryService.getAllTools();

      expect(allTools.some((t: MCPToolDefinition) => t.name === 'testTool')).toBe(true);
      expect(allTools.some((t: MCPToolDefinition) => t.serverId === 'test-server-id')).toBe(true);
    });
  });

  describe('cache operations', () => {
    it('should invalidate cache for a server', async () => {
      // First, populate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      await mcpRegistryService.getServerById('test-server-id');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Invalidate cache
      mcpRegistryService.invalidateCache('test-server-id');

      // Next call should fetch again
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      await mcpRegistryService.getServerById('test-server-id');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache', async () => {
      // Populate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      await mcpRegistryService.getServerById('test-server-id');

      // Clear cache
      mcpRegistryService.clearCache();

      // Next call should fetch again
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResponse,
      });

      await mcpRegistryService.getServerById('test-server-id');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
