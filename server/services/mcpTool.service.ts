import { generateText } from 'ai';
import { models } from '../config/models.js';
import { mcpRegistryService } from './mcpRegistry.service.js';
import { getMCPClient } from './mcpHttpClient.js';
import {
  MCPToolCall,
  MCPToolResult,
  MCPToolDefinition,
} from '../../shared/models/interfaces/mcpServer.js';
import { StreamType } from '../../shared/models/enums/stream.js';

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

async function getToolDefinitions(
  tools: MCPToolCall[],
): Promise<Map<string, { description: string; inputSchema: any }>> {
  const definitions = new Map<string, { description: string; inputSchema: any }>();

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

  const prompt = `You are a tool parameter generator. Given a user's question and a list of tools with their schemas, generate the appropriate parameters for each tool.

User's Question: "${userInput}"

Available Tools:
${toolDescriptions}

For each tool, output a JSON object with the tool name and its parameters. The parameters must match the input schema exactly.

Output format (JSON array):
[
  {
    "toolName": "ToolName",
    "params": { ... parameters matching the schema ... }
  }
]

Only output the JSON array, nothing else. If a tool doesn't need to be called based on the user's question, still include it with sensible default parameters based on the question.`;

  try {
    const { text } = await generateText({
      model: models.fast,
      prompt,
      temperature: 0,
    });

    console.log('[MCP Tool Service] LLM generated parameters:', text);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[MCP Tool Service] Could not parse LLM response as JSON array');
      return tools;
    }

    const generatedParams = JSON.parse(jsonMatch[0]) as Array<{
      toolName: string;
      params: Record<string, unknown>;
    }>;

    return tools.map((tool) => {
      const generated = generatedParams.find((g) => g.toolName === tool.toolName);
      return {
        ...tool,
        params: generated?.params || tool.params || {},
      };
    });
  } catch (error) {
    console.error('[MCP Tool Service] Error generating tool parameters:', error);
    return tools;
  }
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

  console.log(`[MCP Tool Service] Selecting from ${allTools.length} available tools`);

  // Build tool descriptions for the AI
  const toolDescriptions = allTools
    .map((tool) => {
      return `- ${tool.name} (server: ${tool.serverId}): ${tool.description}`;
    })
    .join('\n');

  const prompt = `You are a tool selection assistant. Given a user's question and a list of available tools, determine which tools would be helpful to answer the question.

User's Question: "${userInput}"

Available Tools:
${toolDescriptions}

Instructions:
1. Analyze what the user is trying to accomplish
2. Consider the WORKFLOW - some tools need information from other tools first
3. If the user needs to find/search/discover something before using it, select the search/find tool FIRST
4. If a query tool requires IDs or references, select a tool to find those IDs first
5. Order matters - select prerequisite tools before tools that depend on their output

Examples of correct tool ordering:
- To query a dataset: First use a "search" or "find" tool to get the dataset ID, then use the query tool
- To get details about something: First use a "list" or "search" tool, then use a "get details" tool

Output format (JSON array of selected tools IN ORDER of execution):
[
  {
    "toolName": "ToolName",
    "serverId": "server-id"
  }
]

Only output the JSON array, nothing else. Select tools in the order they should be executed.`;

  try {
    const { text } = await generateText({
      model: models.fast,
      prompt,
      temperature: 0,
    });

    console.log('[MCP Tool Service] AI tool selection response:', text);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log('[MCP Tool Service] No tools selected or could not parse response');
      return [];
    }

    const selectedTools = JSON.parse(jsonMatch[0]) as Array<{
      toolName: string;
      serverId: string;
    }>;

    // Validate that selected tools exist
    const validTools: MCPToolCall[] = selectedTools.filter((selected) => {
      const exists = allTools.some(
        (t) => t.name === selected.toolName && t.serverId === selected.serverId
      );
      if (!exists) {
        console.warn(`[MCP Tool Service] AI selected non-existent tool: ${selected.toolName}`);
      }
      return exists;
    });

    console.log(`[MCP Tool Service] Selected ${validTools.length} tools:`, validTools);
    return validTools;
  } catch (error) {
    console.error('[MCP Tool Service] Error selecting tools:', error);
    return [];
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
 * Execute MCP tools and return results
 */
async function executeTools(
  tools: MCPToolCall[],
  userInput: string,
  emitEvent: (event: any) => void,
): Promise<MCPToolServiceResult> {
  console.log(`[MCP Tool Service] executeTools called with ${tools.length} tools, userInput: "${userInput?.substring(0, 50)}..."`);

  if (!tools || tools.length === 0) {
    console.log('[MCP Tool Service] No tools provided, skipping');
    return {
      textContext: '',
      toolResults: [],
    };
  }

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
        emitEvent({
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
      emitEvent({
        type: StreamType.TOOL_START,
        tool: {
          name: tool.toolName,
          serverId: tool.serverId,
          serverName: server.name,
          params: tool.params || {},
        },
      });

      console.log(`[MCP Tool Service] Executing ${tool.toolName} with params:`, JSON.stringify(tool.params, null, 2));

      const client = getMCPClient(server);
      const result = await client.executeTool(
        tool.toolName,
        tool.params || {},
      );

      // Emit TOOL_RESULT event with execution result
      emitEvent({
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Emit TOOL_ERROR event
      emitEvent({
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

export const mcpToolService = {
  executeTools,
  selectToolsForQuery,
};
