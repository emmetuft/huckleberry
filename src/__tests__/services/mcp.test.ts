import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCPService } from '../../services/mcp';
import { MCPServerCreateInput } from '../../../shared/models/interfaces/mcpServer';

describe('MCPService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let originalFetch: typeof global.fetch;

  const mockServer = {
    id: 'test-id',
    name: 'Test Server',
    url: 'http://localhost:3001/mcp',
    transport: 'http',
    authType: 'none',
    enabled: true,
    createdAt: new Date().toISOString(),
    tools: [],
  };

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('createServer', () => {
    it('should create a new server', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockServer }),
      });

      const input: MCPServerCreateInput = {
        name: 'Test Server',
        url: 'http://localhost:3001/mcp',
        transport: 'http',
        authType: 'none',
      };

      const result = await MCPService.createServer(input);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mcp/servers',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      );
      expect(result).toEqual(mockServer);
    });

    it('should throw error on failure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Name already exists',
        }),
      });

      await expect(
        MCPService.createServer({
          name: 'Test',
          url: 'http://test.com',
          transport: 'http',
          authType: 'none',
        }),
      ).rejects.toThrow('Name already exists');
    });
  });

  describe('getServers', () => {
    it('should fetch all servers', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [mockServer] }),
      });

      const result = await MCPService.getServers();

      expect(fetchMock).toHaveBeenCalledWith('/api/mcp/servers');
      expect(result).toEqual([mockServer]);
    });

    it('should fetch only enabled servers when specified', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [mockServer] }),
      });

      await MCPService.getServers(true);

      expect(fetchMock).toHaveBeenCalledWith('/api/mcp/servers?enabled=true');
    });
  });

  describe('getServer', () => {
    it('should fetch a single server', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockServer }),
      });

      const result = await MCPService.getServer('test-id');

      expect(fetchMock).toHaveBeenCalledWith('/api/mcp/servers/test-id');
      expect(result).toEqual(mockServer);
    });
  });

  describe('updateServer', () => {
    it('should update a server', async () => {
      const updatedServer = { ...mockServer, name: 'Updated Name' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: updatedServer }),
      });

      const result = await MCPService.updateServer('test-id', {
        name: 'Updated Name',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mcp/servers/test-id',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated Name' }),
        }),
      );
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('deleteServer', () => {
    it('should delete a server', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { deleted: true } }),
      });

      const result = await MCPService.deleteServer('test-id');

      expect(fetchMock).toHaveBeenCalledWith('/api/mcp/servers/test-id', {
        method: 'DELETE',
      });
      expect(result.deleted).toBe(true);
    });
  });

  describe('testServerConnection', () => {
    it('should test server connection', async () => {
      const testResult = {
        success: true,
        message: 'Connected',
        tools: [],
        serverInfo: { name: 'Test', version: '1.0.0' },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: testResult }),
      });

      const result = await MCPService.testServerConnection('test-id');

      expect(fetchMock).toHaveBeenCalledWith('/api/mcp/servers/test-id/test', {
        method: 'POST',
      });
      expect(result).toEqual(testResult);
    });
  });

  describe('syncServerTools', () => {
    it('should sync server tools', async () => {
      const syncResult = { server: mockServer, toolCount: 5 };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: syncResult }),
      });

      const result = await MCPService.syncServerTools('test-id');

      expect(fetchMock).toHaveBeenCalledWith('/api/mcp/servers/test-id/sync', {
        method: 'POST',
      });
      expect(result.toolCount).toBe(5);
    });
  });

  describe('toggleServer', () => {
    it('should toggle server enabled state', async () => {
      const toggledServer = { ...mockServer, enabled: false };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: toggledServer }),
      });

      const result = await MCPService.toggleServer('test-id', false);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mcp/servers/test-id/toggle',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ enabled: false }),
        }),
      );
      expect(result.enabled).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should fetch all tools', async () => {
      const mockTools = [
        {
          name: 'tool1',
          description: 'Tool 1',
          inputSchema: { type: 'object' },
          serverId: 'server1',
        },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTools }),
      });

      const result = await MCPService.getTools();

      expect(fetchMock).toHaveBeenCalledWith('/api/mcp/tools');
      expect(result).toEqual(mockTools);
    });
  });

  describe('executeTool', () => {
    it('should execute a tool', async () => {
      const toolResult = {
        success: true,
        content: { result: 'data' },
        executionTime: 50,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: toolResult }),
      });

      const result = await MCPService.executeTool('server-id', 'toolName', {
        param1: 'value1',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mcp/tools/execute',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            serverId: 'server-id',
            toolName: 'toolName',
            params: { param1: 'value1' },
          }),
        }),
      );
      expect(result).toEqual(toolResult);
    });
  });
});
