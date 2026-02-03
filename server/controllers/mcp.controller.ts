import { Request, Response } from 'express';
import { mcpRegistryService } from '../services/mcpRegistry.service.js';
import { getMCPClient, removeMCPClient, MCPHttpClient } from '../services/mcpHttpClient.js';
import {
  MCPServerCreateInput,
  MCPServerUpdateInput,
} from '../../shared/models/interfaces/mcpServer.js';

/**
 * POST /api/mcp/servers
 * Add a new MCP server configuration
 */
export async function createServer(req: Request, res: Response): Promise<void> {
  try {
    const input: MCPServerCreateInput = req.body;

    if (!input.name || !input.url) {
      res.status(400).json({
        success: false,
        error: 'Name and URL are required',
      });
      return;
    }

    if (!input.transport) {
      input.transport = 'http';
    }

    if (!input.authType) {
      input.authType = 'none';
    }

    const server = await mcpRegistryService.createServer(input);

    res.status(201).json({
      success: true,
      data: server,
    });
  } catch (error) {
    console.error('Error creating MCP server:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/mcp/servers
 * List all registered MCP servers
 */
export async function listServers(req: Request, res: Response): Promise<void> {
  try {
    const enabledOnly = req.query.enabled === 'true';
    const servers = enabledOnly
      ? await mcpRegistryService.getEnabledServers()
      : await mcpRegistryService.getAllServers();

    res.json({
      success: true,
      data: servers,
    });
  } catch (error) {
    console.error('Error listing MCP servers:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/mcp/servers/:id
 * Get a specific MCP server configuration
 */
export async function getServer(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const server = await mcpRegistryService.getServerById(id);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    res.json({
      success: true,
      data: server,
    });
  } catch (error) {
    console.error('Error getting MCP server:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * PUT /api/mcp/servers/:id
 * Update an MCP server configuration
 */
export async function updateServer(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const input: MCPServerUpdateInput = req.body;

    const server = await mcpRegistryService.updateServer(id, input);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    removeMCPClient(id);

    res.json({
      success: true,
      data: server,
    });
  } catch (error) {
    console.error('Error updating MCP server:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE /api/mcp/servers/:id
 * Remove an MCP server
 */
export async function deleteServer(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const deleted = await mcpRegistryService.deleteServer(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    removeMCPClient(id);

    res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting MCP server:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/mcp/servers/:id/test
 * Test connection to an MCP server
 */
export async function testConnection(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const server = await mcpRegistryService.getServerById(id);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    const client = new MCPHttpClient(server);
    const result = await client.testConnection();

    if (result.success) {
      await mcpRegistryService.updateConnectionStatus(
        id,
        'connected',
        new Date().toISOString(),
      );
    } else {
      await mcpRegistryService.updateConnectionStatus(id, 'error');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error testing MCP server connection:', error);

    const { id } = req.params;
    await mcpRegistryService.updateConnectionStatus(id, 'error').catch(() => {});

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/mcp/servers/:id/sync
 * Refresh the tool list from an MCP server
 */
export async function syncTools(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const server = await mcpRegistryService.getServerById(id);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    const client = getMCPClient(server);

    try {
      const tools = await client.listTools();

      await mcpRegistryService.syncTools(id, tools);
      await mcpRegistryService.updateConnectionStatus(
        id,
        'connected',
        new Date().toISOString(),
      );

      const updatedServer = await mcpRegistryService.getServerById(id);

      res.json({
        success: true,
        data: {
          server: updatedServer,
          toolCount: tools.length,
        },
      });
    } catch (clientError) {
      await mcpRegistryService.updateConnectionStatus(id, 'error');
      throw clientError;
    }
  } catch (error) {
    console.error('Error syncing MCP server tools:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/mcp/tools
 * List all available tools from all enabled MCP servers
 */
export async function listTools(_req: Request, res: Response): Promise<void> {
  try {
    const tools = await mcpRegistryService.getAllTools();

    res.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    console.error('Error listing MCP tools:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/mcp/tools/execute
 * Execute a tool on an MCP server
 */
export async function executeTool(req: Request, res: Response): Promise<void> {
  try {
    const { serverId, toolName, params } = req.body;

    if (!serverId || !toolName) {
      res.status(400).json({
        success: false,
        error: 'serverId and toolName are required',
      });
      return;
    }

    const server = await mcpRegistryService.getServerById(serverId);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    if (!server.enabled) {
      res.status(400).json({
        success: false,
        error: 'Server is disabled',
      });
      return;
    }

    const client = getMCPClient(server);
    const result = await client.executeTool(toolName, params || {});

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error executing MCP tool:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * PATCH /api/mcp/servers/:id/toggle
 * Toggle server enabled/disabled state
 */
export async function toggleServer(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'enabled must be a boolean',
      });
      return;
    }

    const server = await mcpRegistryService.toggleServerEnabled(id, enabled);

    if (!server) {
      res.status(404).json({
        success: false,
        error: 'Server not found',
      });
      return;
    }

    res.json({
      success: true,
      data: server,
    });
  } catch (error) {
    console.error('Error toggling MCP server:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
