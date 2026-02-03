import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import * as mcpController from '../../controllers/mcp.controller.js';
import { mcpRegistryService } from '../../services/mcpRegistry.service.js';
import * as mcpHttpClient from '../../services/mcpHttpClient.js';
import { MCPServerConfig } from '../../../shared/models/interfaces/mcpServer.js';

vi.mock('../../services/mcpRegistry.service');
vi.mock('../../services/mcpHttpClient');

describe('MCP Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  const mockServer: MCPServerConfig = {
    id: 'test-id',
    name: 'Test Server',
    description: 'Test description',
    url: 'http://localhost:3001/mcp',
    transport: 'http',
    authType: 'none',
    enabled: true,
    createdAt: new Date().toISOString(),
    tools: [],
  };

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
    mockRequest = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /servers - createServer', () => {
    it('should register new MCP server', async () => {
      mockRequest.body = {
        name: 'Test Server',
        url: 'http://localhost:3001/mcp',
        transport: 'http',
        authType: 'none',
      };

      vi.mocked(mcpRegistryService.createServer).mockResolvedValue(mockServer);

      await mcpController.createServer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockServer,
      });
    });

    it('should return 400 when name is missing', async () => {
      mockRequest.body = {
        url: 'http://localhost:3001/mcp',
      };

      await mcpController.createServer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Name and URL are required',
      });
    });

    it('should return 400 when url is missing', async () => {
      mockRequest.body = {
        name: 'Test Server',
      };

      await mcpController.createServer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Name and URL are required',
      });
    });
  });

  describe('GET /servers - listServers', () => {
    it('should list all servers', async () => {
      mockRequest.query = {};
      vi.mocked(mcpRegistryService.getAllServers).mockResolvedValue([
        mockServer,
      ]);

      await mcpController.listServers(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: [mockServer],
      });
    });

    it('should list only enabled servers when enabled=true', async () => {
      mockRequest.query = { enabled: 'true' };
      vi.mocked(mcpRegistryService.getEnabledServers).mockResolvedValue([
        mockServer,
      ]);

      await mcpController.listServers(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mcpRegistryService.getEnabledServers).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: [mockServer],
      });
    });
  });

  describe('GET /servers/:id - getServer', () => {
    it('should return server by id', async () => {
      mockRequest.params = { id: 'test-id' };
      vi.mocked(mcpRegistryService.getServerById).mockResolvedValue(mockServer);

      await mcpController.getServer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockServer,
      });
    });

    it('should return 404 when server not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      vi.mocked(mcpRegistryService.getServerById).mockResolvedValue(null);

      await mcpController.getServer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Server not found',
      });
    });
  });

  describe('POST /servers/:id/test - testConnection', () => {
    it('should test connection and return tools', async () => {
      mockRequest.params = { id: 'test-id' };

      vi.mocked(mcpRegistryService.getServerById).mockResolvedValue(mockServer);

      const mockTestResult = {
        success: true,
        message: 'Connected',
        tools: [
          {
            name: 'testTool',
            description: 'A test tool',
            inputSchema: { type: 'object' },
            serverId: 'test-id',
          },
        ],
        serverInfo: { name: 'Test', version: '1.0.0' },
      };

      const mockClient = {
        testConnection: vi.fn().mockResolvedValue(mockTestResult),
      };

      vi.spyOn(mcpHttpClient, 'MCPHttpClient').mockImplementation(
        () => mockClient as any,
      );

      await mcpController.testConnection(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTestResult,
      });

      expect(mcpRegistryService.updateConnectionStatus).toHaveBeenCalledWith(
        'test-id',
        'connected',
        expect.any(String),
      );
    });

    it('should return 404 when server not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      vi.mocked(mcpRegistryService.getServerById).mockResolvedValue(null);

      await mcpController.testConnection(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('GET /tools - listTools', () => {
    it('should aggregate tools from all enabled servers', async () => {
      const mockTools = [
        {
          name: 'tool1',
          description: 'Tool 1',
          inputSchema: { type: 'object' },
          serverId: 'server1',
          serverName: 'Server 1',
        },
        {
          name: 'tool2',
          description: 'Tool 2',
          inputSchema: { type: 'object' },
          serverId: 'server2',
          serverName: 'Server 2',
        },
      ];

      vi.mocked(mcpRegistryService.getAllTools).mockResolvedValue(mockTools);

      await mcpController.listTools(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTools,
      });
    });
  });

  describe('POST /tools/execute - executeTool', () => {
    it('should execute tool and return result', async () => {
      mockRequest.body = {
        serverId: 'test-id',
        toolName: 'queryDatabase',
        params: { query: 'SELECT * FROM users' },
      };

      vi.mocked(mcpRegistryService.getServerById).mockResolvedValue(mockServer);

      const mockResult = {
        success: true,
        content: { rows: [] },
        executionTime: 100,
      };

      const mockClient = {
        executeTool: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(mcpHttpClient.getMCPClient).mockReturnValue(mockClient as any);

      await mcpController.executeTool(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should return 400 when serverId is missing', async () => {
      mockRequest.body = {
        toolName: 'queryDatabase',
      };

      await mcpController.executeTool(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'serverId and toolName are required',
      });
    });

    it('should return 400 when server is disabled', async () => {
      mockRequest.body = {
        serverId: 'test-id',
        toolName: 'queryDatabase',
      };

      vi.mocked(mcpRegistryService.getServerById).mockResolvedValue({
        ...mockServer,
        enabled: false,
      });

      await mcpController.executeTool(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Server is disabled',
      });
    });
  });

  describe('PATCH /servers/:id/toggle - toggleServer', () => {
    it('should toggle server enabled state', async () => {
      mockRequest.params = { id: 'test-id' };
      mockRequest.body = { enabled: false };

      vi.mocked(mcpRegistryService.toggleServerEnabled).mockResolvedValue({
        ...mockServer,
        enabled: false,
      });

      await mcpController.toggleServer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mcpRegistryService.toggleServerEnabled).toHaveBeenCalledWith(
        'test-id',
        false,
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ enabled: false }),
      });
    });

    it('should return 400 when enabled is not a boolean', async () => {
      mockRequest.params = { id: 'test-id' };
      mockRequest.body = { enabled: 'yes' };

      await mcpController.toggleServer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'enabled must be a boolean',
      });
    });
  });
});
