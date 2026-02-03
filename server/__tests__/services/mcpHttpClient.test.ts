import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCPHttpClient } from '../../services/mcpHttpClient.js';
import { MCPServerConfig } from '../../../shared/models/interfaces/mcpServer.js';

// Helper to create mock response with headers
const createMockResponse = (ok: boolean, data?: any, status = 200, statusText = 'OK') => ({
  ok,
  status,
  statusText,
  headers: {
    get: (name: string) => name === 'Mcp-Session-Id' ? 'mock-session-id' : null,
    entries: () => [['content-type', 'application/json']],
  },
  json: async () => data,
  text: async () => JSON.stringify(data) || '',
});

describe('MCPHttpClient', () => {
  const mockServerConfig: MCPServerConfig = {
    id: 'test-server-id',
    name: 'Test MCP Server',
    url: 'http://localhost:3001/mcp',
    transport: 'http',
    authType: 'bearer',
    authToken: 'test-token-123',
    enabled: true,
    createdAt: new Date().toISOString(),
    tools: [],
  };

  const mockInitializeResponse = {
    jsonrpc: '2.0',
    id: 1,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: {
        name: 'Mock MCP Server',
        version: '1.0.0',
      },
    },
  };

  const mockListToolsResponse = {
    jsonrpc: '2.0',
    id: 2,
    result: {
      tools: [
        {
          name: 'queryDatabase',
          description: 'Execute SQL queries against the database',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'SQL query to execute' },
            },
            required: ['query'],
          },
        },
        {
          name: 'listTables',
          description: 'List all tables in the database',
          inputSchema: { type: 'object' },
        },
      ],
    },
  };

  const mockCallToolResponse = {
    jsonrpc: '2.0',
    id: 3,
    result: {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ rows: [{ id: 1, name: 'test' }] }),
        },
      ],
    },
  };

  let fetchMock: ReturnType<typeof vi.fn>;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect with bearer auth', async () => {
      // Initialize request + notification request
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification

      const client = new MCPHttpClient(mockServerConfig);
      await client.connect();

      expect(fetchMock).toHaveBeenCalledWith(
        mockServerConfig.url,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token-123',
          }),
        }),
      );

      expect(client.isConnected()).toBe(true);
    });

    it('should connect with API key auth', async () => {
      const apiKeyConfig: MCPServerConfig = {
        ...mockServerConfig,
        authType: 'api-key',
        authToken: 'api-key-123',
      };

      // Initialize request + notification request
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification

      const client = new MCPHttpClient(apiKeyConfig);
      await client.connect();

      expect(fetchMock).toHaveBeenCalledWith(
        apiKeyConfig.url,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'api-key-123',
          }),
        }),
      );
    });

    it('should handle auth failure gracefully', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(false, null, 401, 'Unauthorized'));

      const client = new MCPHttpClient(mockServerConfig);

      await expect(client.connect()).rejects.toThrow('HTTP error: 401');
    });
  });

  describe('listTools', () => {
    it('should discover tools from server', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockListToolsResponse));

      const client = new MCPHttpClient(mockServerConfig);
      const tools = await client.listTools();

      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('queryDatabase');
      expect(tools[0].description).toBe(
        'Execute SQL queries against the database',
      );
      expect(tools[0].serverId).toBe(mockServerConfig.id);
      expect(tools[1].name).toBe('listTables');
    });

    it('should auto-connect if not connected', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockListToolsResponse));

      const client = new MCPHttpClient(mockServerConfig);
      expect(client.isConnected()).toBe(false);

      await client.listTools();

      expect(client.isConnected()).toBe(true);
    });
  });

  describe('executeTool', () => {
    it('should execute tool and return result', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockCallToolResponse));

      const client = new MCPHttpClient(mockServerConfig);
      const result = await client.executeTool('queryDatabase', {
        query: 'SELECT * FROM users',
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle tool execution error', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {
        jsonrpc: '2.0',
        id: 3,
        error: {
          code: -32000,
          message: 'Tool execution failed',
        },
      }));

      const client = new MCPHttpClient(mockServerConfig);
      const result = await client.executeTool('queryDatabase', {
        query: 'INVALID SQL',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tool execution failed');
    });
  });

  describe('testConnection', () => {
    it('should return success with tools on successful connection', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockListToolsResponse));

      const client = new MCPHttpClient(mockServerConfig);
      const result = await client.testConnection();

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully connected');
      expect(result.tools).toHaveLength(2);
      expect(result.serverInfo).toBeDefined();
      expect(result.serverInfo?.name).toBe('Mock MCP Server');
    });

    it('should return failure message on connection error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const client = new MCPHttpClient(mockServerConfig);
      const result = await client.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });
  });

  describe('disconnect', () => {
    it('should reset connection state', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(true, mockInitializeResponse));
      fetchMock.mockResolvedValueOnce(createMockResponse(true, {})); // notification

      const client = new MCPHttpClient(mockServerConfig);
      await client.connect();

      expect(client.isConnected()).toBe(true);

      await client.disconnect();

      expect(client.isConnected()).toBe(false);
      expect(client.getServerInfo()).toBeUndefined();
    });
  });
});
