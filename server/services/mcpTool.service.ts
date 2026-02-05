import { generateText } from 'ai';
import { models } from '../config/models.js';
import { mcpRegistryService } from './mcpRegistry.service.js';
import { getMCPClient } from './mcpHttpClient.js';
import {
  MCPToolCall,
  MCPToolResult,
} from '../../shared/models/interfaces/mcpServer.js';
import { StreamType } from '../../shared/models/enums/stream.js';
import { UserRequest } from '../../shared/models/interfaces/userRequest.ts';
import { ContextResult } from '../../shared/models/interfaces/context.ts';
import {
  TOOL_PARAMS_PROMPT,
  TOOL_SELECTION_PROMPT,
} from '../constants/prompts.ts';
import { parseJsonArrayFromResponse } from '../utils/aiResponse.js';

interface ToolExecutionResult {
  toolName: string;
  serverId: string;
  serverName?: string;
  params?: Record<string, unknown>;
  result: MCPToolResult;
}

interface MCPToolServiceResult {
  textContext: string;
  toolResults: ToolExecutionResult[];
}

/**
 * Use AI to select appropriate tools from all available tools based on user's query
 */
async function selectToolsForQuery(userInput: string): Promise<MCPToolCall[]> {
  const allTools = await mcpRegistryService.getAllTools();

  if (allTools.length === 0) {
    console.log('[MCP Tool Service] No tools available from any server');
    return [];
  }

  // Build tool descriptions for the AI
  const toolDescriptions = allTools
    .map((tool) => {
      return `- ${tool.name} (server: ${tool.serverId}): ${tool.description}`;
    })
    .join('\n');

  const prompt = `${TOOL_SELECTION_PROMPT}

  User's Question: "${userInput}"

Available Tools:
${toolDescriptions}`;

  try {
    const { text } = await generateText({
      model: models.fast,
      prompt,
      temperature: 0,
    });

    console.log('[MCP Tool Service] AI tool selection response:', text);

    const selectedTools = parseJsonArrayFromResponse<{
      toolName: string;
      serverId: string;
    }>(text);

    if (!selectedTools) {
      console.error(
        '[MCP Tool Service] Could not parse LLM response as JSON array',
      );
      return [];
    }

    // Validate that selected tools exist
    const validTools = selectedTools.filter((selected) => {
      const exists = allTools.some(
        (t) => t.name === selected.toolName && t.serverId === selected.serverId,
      );
      if (!exists) {
        console.warn(
          `[MCP Tool Service] AI selected non-existent tool: ${selected.toolName}`,
        );
      }
      return exists;
    });

    return validTools;
  } catch (error) {
    console.error('[MCP Tool Service] Error selecting tools:', error);
    return [];
  }
}

/**
 * Execute MCP tools and return results
 */
async function executeTools(
  tools: MCPToolCall[],
  userInput: string,
  emitEvent?: (event: any) => void,
): Promise<MCPToolServiceResult> {
  console.log('[MCP Tool Service] Tools:', JSON.stringify(tools, null, 2));

  // Get tool definitions for LLM parameter generation
  const toolDefinitions = await getToolDefinitions(tools);

  // Use LLM to generate parameters for each tool based on user's question
  const toolsWithParams = await generateToolParameters(
    userInput,
    tools,
    toolDefinitions,
  );

  const toolResults: ToolExecutionResult[] = [];

  for (const tool of toolsWithParams) {
    try {
      const server = await mcpRegistryService.getServerById(tool.serverId);
      if (!server || !server.enabled) {
        emitEvent?.({
          type: StreamType.TOOL_ERROR,
          tool: {
            name: tool.toolName,
            serverId: tool.serverId,
            error: 'Server not found or disabled',
          },
        });
        toolResults.push({
          toolName: tool.toolName,
          serverId: tool.serverId,
          params: tool.params,
          result: {
            success: false,
            error: 'Server not found or disabled',
          },
        });
        continue;
      }

      // Emit TOOL_START event with tool info and generated params
      emitEvent?.({
        type: StreamType.TOOL_START,
        tool: {
          name: tool.toolName,
          serverId: tool.serverId,
          serverName: server.name,
          params: tool.params || {},
        },
      });

      console.log(
        `[MCP Tool Service] Executing ${tool.toolName} with params:`,
        JSON.stringify(tool.params, null, 2),
      );

      const client = getMCPClient(server);
      const result = await client.executeTool(tool.toolName, tool.params || {});

      // Emit TOOL_RESULT event with execution result
      emitEvent?.({
        type: StreamType.TOOL_RESULT,
        tool: {
          name: tool.toolName,
          serverId: tool.serverId,
          serverName: server.name,
          params: tool.params || {},
          success: result.success,
          executionTime: result.executionTime,
          content: result.content,
          error: result.error,
        },
      });

      toolResults.push({
        toolName: tool.toolName,
        serverId: tool.serverId,
        serverName: server.name,
        params: tool.params,
        result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Emit TOOL_ERROR event
      emitEvent?.({
        type: StreamType.TOOL_ERROR,
        tool: {
          name: tool.toolName,
          serverId: tool.serverId,
          params: tool.params || {},
          error: errorMessage,
        },
      });

      toolResults.push({
        toolName: tool.toolName,
        serverId: tool.serverId,
        params: tool.params,
        result: {
          success: false,
          error: errorMessage,
        },
      });
    }
  }

  const textContext = formatToolResults(toolResults);

  return {
    textContext,
    toolResults,
  };
}

async function getToolDefinitions(
  tools: MCPToolCall[],
): Promise<Map<string, { description: string; inputSchema: any }>> {
  const definitions = new Map<
    string,
    { description: string; inputSchema: any }
  >();

  for (const tool of tools) {
    const server = await mcpRegistryService.getServerById(tool.serverId);
    if (server?.tools) {
      const toolDef = server.tools.find((t) => t.name === tool.toolName);
      if (toolDef) {
        definitions.set(`${tool.serverId}:${tool.toolName}`, {
          description: toolDef.description,
          inputSchema: toolDef.inputSchema,
        });
      }
    }
  }

  return definitions;
}

async function generateToolParameters(
  userInput: string,
  tools: MCPToolCall[],
  toolDefinitions: Map<string, { description: string; inputSchema: any }>,
): Promise<MCPToolCall[]> {
  const toolDescriptions = tools
    .map((tool) => {
      const def = toolDefinitions.get(`${tool.serverId}:${tool.toolName}`);
      if (!def) return null;
      return `Tool: ${tool.toolName}
Description: ${def.description}
Input Schema: ${JSON.stringify(def.inputSchema, null, 2)}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${TOOL_PARAMS_PROMPT}

User's Question: "${userInput}"

Available Tools:
${toolDescriptions}`;

  try {
    const { text } = await generateText({
      model: models.fast,
      prompt,
      temperature: 0,
    });

    console.log('[MCP Tool Service] LLM generated parameters:', text);

    const generatedParams = parseJsonArrayFromResponse<{
      toolName: string;
      params: Record<string, unknown>;
    }>(text);

    if (!generatedParams) {
      console.error(
        '[MCP Tool Service] Could not parse LLM response as JSON array',
      );
      return tools;
    }

    return tools.map((tool) => {
      const generated = generatedParams.find(
        (g) => g.toolName === tool.toolName,
      );
      return {
        ...tool,
        params: generated?.params || tool.params || {},
      };
    });
  } catch (error) {
    console.error(
      '[MCP Tool Service] Error generating tool parameters:',
      error,
    );
    return tools;
  }
}

function formatToolResults(toolResults: ToolExecutionResult[]): string {
  if (toolResults.length === 0) {
    return '';
  }

  const sections = toolResults.map((tr) => {
    const header = `## Tool: ${tr.toolName}${tr.serverName ? ` (from ${tr.serverName})` : ''}`;

    if (!tr.result.success) {
      return `${header}\nError: ${tr.result.error}`;
    }

    let contentStr: string;
    if (typeof tr.result.content === 'string') {
      contentStr = tr.result.content;
    } else {
      contentStr = JSON.stringify(tr.result.content, null, 2);
    }

    return `${header}\n${contentStr}`;
  });

  return `# MCP Tool Results\n\n${sections.join('\n\n---\n\n')}`;
}

/**
 * Build MCP Tool context for a user request
 * Handles tool selection and execution, returning formatted context
 */
async function buildMcpToolContext(
  userRequest: UserRequest,
  emitEvent?: (event: any) => void,
): Promise<ContextResult> {
  const { tools: userTools, userInput } = userRequest;
  const hasUserTools = userTools && userTools.length > 0;

  let toolsToExecute: MCPToolCall[];

  if (hasUserTools) {
    toolsToExecute = userTools as MCPToolCall[];
  } else {
    // AI selected the strategy - use AI to pick which tools to use
    toolsToExecute = await selectToolsForQuery(userInput);

    if (toolsToExecute.length === 0) {
      console.log(`[buildMcpToolContext] AI selected no tools for this query`);
      return {
        textContext: '',
        metadata: {
          toolResults: [],
        },
      };
    }
  }

  const { textContext, toolResults } = await executeTools(
    toolsToExecute,
    userInput,
    emitEvent,
  );

  return {
    textContext,
    metadata: {
      toolsExecuted: toolResults.map((r) => ({
        toolName: r.toolName,
        serverId: r.serverId,
        serverName: r.serverName,
        params: r.params,
        success: r.result.success,
        executionTime: r.result.executionTime,
      })),
      toolResults,
    },
  };
}

export const mcpToolService = {
  buildMcpToolContext,
};
