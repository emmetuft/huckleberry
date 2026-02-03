import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { Server } from 'http';
import { setupServer } from '../../index.js';
import { mcpRegistryService } from '../../services/mcpRegistry.service.js';

// Mock fetch for AppDB calls
const originalFetch = global.fetch;
const mockFetch = vi.fn();

/**
 * Integration tests for MCP External Server functionality
 *
 * These tests verify the full flow:
 * 1. Add external MCP server → Test connection → Tools appear in chat
 * 2. Select tool → Send message → Tool executes → Result in response
 * 3. Disable server → Tools no longer appear
 * 4. Tool execution fails → Graceful error handling
 */
describe('MCP External Server Integration', () => {
  let app: Express;
  let mockMCPServer: Express;
  let mockMCPServerInstance: Server;
  const MOCK_MCP_PORT = 3099;
  const MOCK_MCP_URL = `http://localhost:${MOCK_MCP_PORT}/mcp`;

  // Mock server data storage (simulates AppDB)
  let mockServerStorage: Map<string, any>;
  let nextServerId = 1;

  // Mock MCP server responses
  const mockTools = [
    {
      name: 'queryDatabase',
      description: 'Execute SQL queries',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'SQL query' },
        },
        required: ['query'],
      },
    },
    {
      name: 'listTables',
      description: 'List all database tables',
      inputSchema: { type: 'object' },
    },
  ];

  beforeAll(async () => {
    mockServerStorage = new Map();

    // Setup mock fetch for AppDB calls
    mockFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      const urlStr = url.toString();
      const method = options?.method || 'GET';

      // Handle AppDB collection document operations
      if (urlStr.includes('/api/datastores/v2/collections/')) {
        if (method === 'POST' && urlStr.endsWith('/documents')) {
          // Create document
          const body = JSON.parse(options?.body as string);
          const id = `server-${nextServerId++}`;
          const doc = { id, content: body.content };
          mockServerStorage.set(id, doc);
          return {
            ok: true,
            json: async () => doc,
          };
        } else if (method === 'GET' && urlStr.endsWith('/documents')) {
          // List documents
          return {
            ok: true,
            json: async () => Array.from(mockServerStorage.values()),
          };
        } else if (method === 'GET' && urlStr.includes('/documents/')) {
          // Get single document
          const id = urlStr.split('/documents/')[1];
          const doc = mockServerStorage.get(id);
          if (doc) {
            return {
              ok: true,
              json: async () => doc,
            };
          }
          return { ok: false, status: 404 };
        } else if (method === 'PUT' && urlStr.includes('/documents/')) {
          // Update document
          const id = urlStr.split('/documents/')[1];
          const existing = mockServerStorage.get(id);
          if (existing) {
            const body = JSON.parse(options?.body as string);
            const updated = { id, content: body.content };
            mockServerStorage.set(id, updated);
            return {
              ok: true,
              json: async () => updated,
            };
          }
          return { ok: false, status: 404 };
        } else if (method === 'DELETE' && urlStr.includes('/documents/')) {
          // Delete document
          const id = urlStr.split('/documents/')[1];
          if (mockServerStorage.has(id)) {
            mockServerStorage.delete(id);
            return { ok: true };
          }
          return { ok: false, status: 404 };
        }
      }

      // For all other URLs (like the mock MCP server), use original fetch
      return originalFetch(url, options);
    });

    global.fetch = mockFetch;

    // Setup main app
    app = express();
    await setupServer(app);

    // Setup mock MCP server
    mockMCPServer = express();
    mockMCPServer.use(express.json());

    mockMCPServer.post('/mcp', (req, res) => {
      const { method } = req.body;

      switch (method) {
        case 'initialize':
          res.json({
            jsonrpc: '2.0',
            id: req.body.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: { name: 'Mock MCP Server', version: '1.0.0' },
            },
          });
          break;

        case 'notifications/initialized':
          res.json({ jsonrpc: '2.0', id: req.body.id });
          break;

        case 'tools/list':
          res.json({
            jsonrpc: '2.0',
            id: req.body.id,
            result: { tools: mockTools },
          });
          break;

        case 'tools/call':
          const { name } = req.body.params;
          if (name === 'queryDatabase') {
            res.json({
              jsonrpc: '2.0',
              id: req.body.id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      rows: [{ id: 1, name: 'Test Result' }],
                    }),
                  },
                ],
              },
            });
          } else if (name === 'failingTool') {
            res.json({
              jsonrpc: '2.0',
              id: req.body.id,
              error: {
                code: -32000,
                message: 'Tool execution failed',
              },
            });
          } else {
            res.json({
              jsonrpc: '2.0',
              id: req.body.id,
              result: { content: [{ type: 'text', text: 'OK' }] },
            });
          }
          break;

        default:
          res.json({
            jsonrpc: '2.0',
            id: req.body.id,
            error: { code: -32601, message: 'Method not found' },
          });
      }
    });

    mockMCPServerInstance = mockMCPServer.listen(MOCK_MCP_PORT);
  });

  afterAll(async () => {
    mockMCPServerInstance?.close();
    mcpRegistryService.close();
    global.fetch = originalFetch;
  });

  let createdServerId: string | null = null;

  beforeEach(async () => {
    // Clean up any servers from previous tests
    if (createdServerId) {
      await mcpRegistryService.deleteServer(createdServerId);
      createdServerId = null;
    }
    mcpRegistryService.clearCache();
  });

  describe('Scenario 1: Add external MCP server → Test connection → Tools appear', () => {
    it('should add a new MCP server', async () => {
      const response = await request(app)
        .post('/api/mcp/servers')
        .send({
          name: 'Test External Server',
          description: 'Integration test server',
          url: MOCK_MCP_URL,
          transport: 'http',
          authType: 'none',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('Test External Server');

      createdServerId = response.body.data.id;
    });

    it('should test connection and discover tools', async () => {
      // First create a server
      const createResponse = await request(app)
        .post('/api/mcp/servers')
        .send({
          name: 'Test Server for Connection',
          url: MOCK_MCP_URL,
          transport: 'http',
          authType: 'none',
        });

      createdServerId = createResponse.body.data.id;

      // Then test connection
      const testResponse = await request(app)
        .post(`/api/mcp/servers/${createdServerId}/test`)
        .send();

      expect(testResponse.status).toBe(200);
      expect(testResponse.body.success).toBe(true);
      expect(testResponse.body.data.success).toBe(true);
      expect(testResponse.body.data.tools).toBeDefined();
      expect(testResponse.body.data.tools.length).toBe(2);
      expect(testResponse.body.data.serverInfo.name).toBe('Mock MCP Server');
    });

    it('should sync tools and make them available', async () => {
      // Create server
      const createResponse = await request(app)
        .post('/api/mcp/servers')
        .send({
          name: 'Test Server for Sync',
          url: MOCK_MCP_URL,
          transport: 'http',
          authType: 'none',
        });

      createdServerId = createResponse.body.data.id;

      // Sync tools
      const syncResponse = await request(app)
        .post(`/api/mcp/servers/${createdServerId}/sync`)
        .send();

      expect(syncResponse.status).toBe(200);
      expect(syncResponse.body.data.toolCount).toBe(2);

      // Verify tools are available
      const toolsResponse = await request(app)
        .get('/api/mcp/tools')
        .send();

      expect(toolsResponse.status).toBe(200);
      const serverTools = toolsResponse.body.data.filter(
        (t: any) => t.serverId === createdServerId,
      );
      expect(serverTools.length).toBe(2);
      expect(serverTools.map((t: any) => t.name)).toContain('queryDatabase');
    });
  });

  describe('Scenario 2: Select tool → Execute → Result in response', () => {
    it('should execute a tool and return result', async () => {
      // Create and sync server
      const createResponse = await request(app)
        .post('/api/mcp/servers')
        .send({
          name: 'Test Server for Execution',
          url: MOCK_MCP_URL,
          transport: 'http',
          authType: 'none',
        });

      createdServerId = createResponse.body.data.id;

      await request(app)
        .post(`/api/mcp/servers/${createdServerId}/sync`)
        .send();

      // Execute tool
      const executeResponse = await request(app)
        .post('/api/mcp/tools/execute')
        .send({
          serverId: createdServerId,
          toolName: 'queryDatabase',
          params: { query: 'SELECT * FROM users' },
        });

      expect(executeResponse.status).toBe(200);
      expect(executeResponse.body.success).toBe(true);
      expect(executeResponse.body.data.success).toBe(true);
      expect(executeResponse.body.data.content).toBeDefined();
    });
  });

  describe('Scenario 3: Disable server → Tools no longer appear', () => {
    it('should hide tools when server is disabled', async () => {
      // Create and sync server
      const createResponse = await request(app)
        .post('/api/mcp/servers')
        .send({
          name: 'Test Server for Disable',
          url: MOCK_MCP_URL,
          transport: 'http',
          authType: 'none',
        });

      createdServerId = createResponse.body.data.id;

      await request(app)
        .post(`/api/mcp/servers/${createdServerId}/sync`)
        .send();

      // Verify tools exist
      let toolsResponse = await request(app).get('/api/mcp/tools').send();
      const initialToolCount = toolsResponse.body.data.filter(
        (t: any) => t.serverId === createdServerId,
      ).length;
      expect(initialToolCount).toBeGreaterThan(0);

      // Disable server
      await request(app)
        .patch(`/api/mcp/servers/${createdServerId}/toggle`)
        .send({ enabled: false });

      // Verify tools are hidden
      toolsResponse = await request(app).get('/api/mcp/tools').send();
      const disabledToolCount = toolsResponse.body.data.filter(
        (t: any) => t.serverId === createdServerId,
      ).length;
      expect(disabledToolCount).toBe(0);
    });
  });

  describe('Scenario 4: Tool execution fails → Graceful error handling', () => {
    it('should return error for non-existent server', async () => {
      const executeResponse = await request(app)
        .post('/api/mcp/tools/execute')
        .send({
          serverId: 'non-existent-server-id',
          toolName: 'anyTool',
          params: {},
        });

      expect(executeResponse.status).toBe(404);
      expect(executeResponse.body.success).toBe(false);
      expect(executeResponse.body.error).toBe('Server not found');
    });

    it('should return error for disabled server', async () => {
      // Create server but disable it
      const createResponse = await request(app)
        .post('/api/mcp/servers')
        .send({
          name: 'Disabled Server',
          url: MOCK_MCP_URL,
          transport: 'http',
          authType: 'none',
          enabled: false,
        });

      createdServerId = createResponse.body.data.id;

      const executeResponse = await request(app)
        .post('/api/mcp/tools/execute')
        .send({
          serverId: createdServerId,
          toolName: 'queryDatabase',
          params: {},
        });

      expect(executeResponse.status).toBe(400);
      expect(executeResponse.body.error).toBe('Server is disabled');
    });
  });
});
