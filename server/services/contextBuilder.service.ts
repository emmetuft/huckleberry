import { generateText, streamText } from 'ai';
import {
  GraphContext,
  UserRequest,
} from '../../shared/models/interfaces/userRequest.ts';
import { models } from '../config/models.js';
import {
  ContextStrategyType,
  STRATEGY_EXP_MAP,
} from '../../shared/models/enums/contextStrategy.ts';
import { StreamStatus, StreamType } from '../../shared/models/enums/stream.ts';
import {
  CONTEXT_STRATEGY_PROMPT,
  ULTIMATE_PROMPT,
} from '../constants/prompts.ts';
import {
  GRAPH_RAG_DESCRIPTION,
  METRIC_DESCRIPTION,
  PERSONA_DESCRIPTION,
  MCP_TOOL_DESCRIPTION,
} from '../constants/strategies.ts';
import { graphRagService } from './graphRag.service.js';
import { metricService } from './metric.service.js';
import { personaService } from './persona.service.js';
import { fileService } from './file.service.js';
import { mcpRegistryService } from './mcpRegistry.service.js';
import { getMCPClient } from './mcpHttpClient.js';
import {
  MCPToolCall,
  MCPToolResult,
} from '../../shared/models/interfaces/mcpServer.js';
import { datasourceService } from './datasource.service.js';

interface ContextResult {
  textContext: string;
  graphContext?: GraphContext;
  metadata: {
    [key: string]: any;
  };
}

interface ContextStrategy {
  name: string;
  description: string;
  priority: number;
  buildContext(userRequest: UserRequest, emitEvent?: (event: any) => void): Promise<ContextResult>;
}

class GraphRagStrategy implements ContextStrategy {
  name = ContextStrategyType.GRAPH_RAG;
  description = GRAPH_RAG_DESCRIPTION;
  priority = 1;

  async buildContext(userRequest: UserRequest): Promise<ContextResult> {
    const { context, formattedContext, cypherQuery } =
      await graphRagService.retrieveGraphContext(userRequest);

    return {
      textContext: formattedContext,
      graphContext: context,
      metadata: {
        strategy: this.name,
        cypherQuery,
      },
    };
  }
}

class MetricStrategy implements ContextStrategy {
  name = ContextStrategyType.METRIC;
  description = METRIC_DESCRIPTION;
  priority = 2;

  async buildContext(userRequest: UserRequest): Promise<ContextResult> {
    const { userInput, userId } = userRequest;

    const { textContext, graphContext, metadata } =
      await metricService.buildMetricContext(userInput, userId);

    return {
      textContext,
      graphContext,
      metadata: {
        strategy: this.name,
        ...metadata,
      },
    };
  }
}

class PersonaStrategy implements ContextStrategy {
  name = ContextStrategyType.PERSONA;
  description = PERSONA_DESCRIPTION;
  priority = 3;

  async buildContext(userRequest: UserRequest): Promise<ContextResult> {
    const { userId } = userRequest;

    const { textContext, metadata } =
      await personaService.buildPersonaContext(userId);

    return {
      textContext,
      metadata: {
        strategy: this.name,
        ...metadata,
      },
    };
  }
}

class MCPToolStrategy implements ContextStrategy {
  name = ContextStrategyType.MCP_TOOL;
  description = MCP_TOOL_DESCRIPTION;
  priority = 0;

  async buildContext(userRequest: UserRequest, emitEvent?: (event: any) => void): Promise<ContextResult> {
    const { tools, userInput } = userRequest;

    console.log(`[MCP Strategy] buildContext called with ${tools?.length || 0} tools, userInput: "${userInput?.substring(0, 50)}..."`);

    if (!tools || tools.length === 0) {
      console.log('[MCP Strategy] No tools provided, skipping');
      return {
        textContext: '',
        metadata: {
          strategy: this.name,
          toolsExecuted: [],
        },
      };
    }

    console.log('[MCP Strategy] Tools:', JSON.stringify(tools, null, 2));

    // Get tool definitions for LLM parameter generation
    const toolDefinitions = await this.getToolDefinitions(tools as MCPToolCall[]);

    // Use LLM to generate parameters for each tool based on user's question
    const toolsWithParams = await this.generateToolParameters(
      userInput,
      tools as MCPToolCall[],
      toolDefinitions,
    );

    const toolResults: Array<{
      toolName: string;
      serverId: string;
      serverName?: string;
      params?: Record<string, unknown>;
      result: MCPToolResult;
    }> = [];

    for (const tool of toolsWithParams) {
      try {
        const server = await mcpRegistryService.getServerById(tool.serverId);
        if (!server || !server.enabled) {
          // Emit error for disabled/missing server
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

        console.log(`[MCP Strategy] Executing ${tool.toolName} with params:`, JSON.stringify(tool.params, null, 2));

        const client = getMCPClient(server);
        const result = await client.executeTool(
          tool.toolName,
          tool.params || {},
        );

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

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

    const textContext = this.formatToolResults(toolResults);

    return {
      textContext,
      metadata: {
        strategy: this.name,
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

  private async getToolDefinitions(
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

  private async generateToolParameters(
    userInput: string,
    tools: MCPToolCall[],
    toolDefinitions: Map<string, { description: string; inputSchema: any }>,
  ): Promise<MCPToolCall[]> {
    // Build a prompt for the LLM to generate parameters
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

      console.log('[MCP Strategy] LLM generated parameters:', text);

      // Parse the LLM response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('[MCP Strategy] Could not parse LLM response as JSON array');
        return tools; // Return original tools without params
      }

      const generatedParams = JSON.parse(jsonMatch[0]) as Array<{
        toolName: string;
        params: Record<string, unknown>;
      }>;

      // Merge generated params back into tools
      return tools.map((tool) => {
        const generated = generatedParams.find((g) => g.toolName === tool.toolName);
        return {
          ...tool,
          params: generated?.params || tool.params || {},
        };
      });
    } catch (error) {
      console.error('[MCP Strategy] Error generating tool parameters:', error);
      return tools; // Return original tools on error
    }
  }

  private formatToolResults(
    toolResults: Array<{
      toolName: string;
      serverId: string;
      serverName?: string;
      result: MCPToolResult;
    }>,
  ): string {
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
}

class ContextBuilderService {
  private model;
  private strategies: ContextStrategy[] = [];

  constructor() {
    this.model = models.contextBuilder;

    // Register available strategies (sorted by priority)
    this.registerStrategy(new PersonaStrategy());
    this.registerStrategy(new MetricStrategy());
    this.registerStrategy(new GraphRagStrategy());
    this.registerStrategy(new MCPToolStrategy());
  }

  registerStrategy(strategy: ContextStrategy): void {
    this.strategies.push(strategy);
    // Sort by priority (higher priority first)
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Use AI to intelligently select which strategies should be used for this request
   */
  private async selectStrategies(
    userRequest: UserRequest,
  ): Promise<ContextStrategy[]> {
    if (userRequest.dataSources && userRequest.dataSources.length > 0) {
      // If specific datasources are requested, skip strategy selection
      return [];
    }

    const { userInput, tools } = userRequest;

    // Build strategy descriptions for the AI (excluding MCP_TOOL which is auto-selected)
    const aiSelectableStrategies = this.strategies.filter(
      (s) => s.name !== ContextStrategyType.MCP_TOOL,
    );
    const strategyDescriptions = aiSelectableStrategies
      .map((s) => `- ${s.name}: ${s.description}`)
      .join('\n');

    const prompt = CONTEXT_STRATEGY_PROMPT(strategyDescriptions, userInput);

    let selected: ContextStrategy[] = [];

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0,
      });

      const cleanedText = text.trim().replace(/```json\n?|\n?```/g, '');
      const selectedNames: string[] = JSON.parse(cleanedText);
      console.log('AI selected strategies:', selectedNames);

      selected = this.strategies.filter((s) => selectedNames.includes(s.name));
    } catch (error) {
      console.error('Error selecting strategies:', error);
    }

    // Auto-include MCP_TOOL strategy if tools are provided
    console.log(`[Strategy Selection] tools in request:`, tools);
    if (tools && tools.length > 0) {
      console.log(`[Strategy Selection] Auto-including MCP_TOOL strategy for ${tools.length} tools`);
      const mcpStrategy = this.strategies.find(
        (s) => s.name === ContextStrategyType.MCP_TOOL,
      );
      if (mcpStrategy && !selected.includes(mcpStrategy)) {
        selected.unshift(mcpStrategy);
      }
    }

    console.log(`[Strategy Selection] Final strategies:`, selected.map(s => s.name));
    return selected;
  }

  /**
   * Merge multiple context results into a single unified context
   */
  private mergeContextResults(results: ContextResult[]): ContextResult {
    if (results.length === 0) {
      return {
        textContext: '',
        metadata: {},
      };
    }

    let mergedTextContext = '';
    let graphContext: GraphContext | undefined = undefined;
    const metadata: any = {
      strategy: results.map((r) => r.metadata.strategy),
    };

    // Merge all text contexts
    results.forEach((result, index) => {
      if (index > 0) {
        mergedTextContext += '\n\n---\n\n';
      }
      mergedTextContext += result.textContext;

      // If this result has a graph context, use it
      if (result.graphContext) {
        graphContext = result.graphContext;
      }

      // Merge metadata
      Object.keys(result.metadata).forEach((key) => {
        if (key !== 'strategy') {
          metadata[key] = result.metadata[key];
        }
      });
    });

    return {
      textContext: mergedTextContext,
      graphContext,
      metadata,
    };
  }

  private buildMessages(
    mergedTextContext: string,
    userRequest: UserRequest,
  ): Array<{ role: 'user'; content: any }> {
    const content: any[] = [];

    // Add context as text
    if (mergedTextContext) {
      content.push({
        type: 'text',
        text: `${mergedTextContext}\n\nPlease address the request based on the context provided above.`,
      });
    }

    // Add user input as text
    content.push({
      type: 'text',
      text: `User input: ${userRequest.userInput}`,
    });

    // Add files as file parts if provided
    if (userRequest.files && userRequest.files.length > 0) {
      const fileParts = fileService.buildFilePartsForAI(userRequest.files);
      content.push(...fileParts);
    }

    return [
      {
        role: 'user',
        content,
      },
    ];
  }

  async queryStream(userRequest: UserRequest, emitEvent: (event: any) => void) {
    // 1. Analyze request
    const strategiesToRun = await this.runStep(
      emitEvent,
      { id: 'analyze-request', title: 'Analyzing your request' },
      () => this.selectStrategies(userRequest),
      (strategies) => ({
        selectedStrategies: strategies.map((s) => s.name),
      }),
    );

    // 2. Run strategies + datasources in parallel
    const results = await Promise.all([
      ...strategiesToRun.map((s) =>
        this.runStrategy(s, userRequest, emitEvent),
      ),
      ...(userRequest.dataSources || []).map((ds) =>
        this.runDatasource(ds, userRequest, emitEvent),
      ),
    ]);

    // 3. Generate response
    const { textContext, graphContext } = this.mergeContextResults(results);

    emitEvent({ type: 'metadata', context: graphContext });

    const messages = this.buildMessages(textContext, userRequest);

    // Step: Generating response
    emitEvent({
      type: StreamType.STEP_START,
      step: {
        id: 'generate-response',
        title: 'Generating response',
        status: StreamStatus.IN_PROGRESS,
      },
    });

    const result = streamText({
      model: this.model,
      system: ULTIMATE_PROMPT,
      messages,
      temperature: 0.7,
    });

    emitEvent({
      type: StreamType.STEP_COMPLETE,
      step: {
        id: 'generate-response',
        title: 'Generating response',
        status: StreamStatus.COMPLETE,
      },
    });

    return {
      textStream: result.textStream,
    };
  }

  async runStep<T>(
    emitEvent: (event: any) => void,
    step: { id: string; title: string },
    work: () => Promise<T>,
    details?: (result: T) => any,
  ): Promise<T> {
    emitEvent({
      type: StreamType.STEP_START,
      step: { ...step, status: StreamStatus.IN_PROGRESS },
    });

    try {
      const result = await work();

      emitEvent({
        type: StreamType.STEP_COMPLETE,
        step: {
          ...step,
          status: StreamStatus.COMPLETE,
          details: details?.(result),
        },
      });

      return result;
    } catch (error) {
      emitEvent({
        type: StreamType.STEP_COMPLETE,
        step: {
          ...step,
          status: StreamStatus.COMPLETE,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });

      throw error;
    }
  }

  private async runStrategy(
    strategy: ContextStrategy,
    userRequest: UserRequest,
    emitEvent: (event: any) => void,
  ) {
    const stepId = `strategy-${strategy.name}`;
    const title = STRATEGY_EXP_MAP[strategy.name as ContextStrategyType];

    try {
      return await this.runStep(
        emitEvent,
        { id: stepId, title },
        () => strategy.buildContext(userRequest, emitEvent),
        (result) => ({
          strategyName: strategy.name,
          graphContext: result.graphContext,
          metadata: result.metadata,
        }),
      );
    } catch (error) {
      return {
        textContext: '',
        metadata: {
          strategy: strategy.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async runDatasource(
    datasource: { id: string; name?: string },
    userRequest: UserRequest,
    emitEvent: (event: any) => void,
  ) {
    const stepId = `datasource-${datasource.id}`;
    const title = `Querying datasource: ${datasource.name || datasource.id}`;

    try {
      return await this.runStep(
        emitEvent,
        { id: stepId, title },
        async () => {
          const { data, query } = await datasourceService.queryDatasource(
            userRequest.userInput,
            datasource,
          );

          return { data, query };
        },
        ({ data, query }) => ({
          datasourceId: datasource.id,
          query,
          resultCount: data.length,
        }),
      ).then(({ data, query }) => ({
        textContext: this.formatDatasourceContext(datasource, data, query),
        metadata: {
          datasourceId: datasource.id,
          datasourceName: datasource.name || datasource.id,
          query,
          resultCount: data.length,
        },
      }));
    } catch (error) {
      return {
        textContext: `# Datasource: ${datasource.name || datasource.id}\n\nError querying datasource: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        metadata: {
          datasourceId: datasource.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private formatDatasourceContext(
    datasource: { id: string; name?: string },
    data: unknown[],
    query: string,
  ): string {
    const name = datasource.name || datasource.id;

    return [
      `# Datasource: ${name}`,
      ``,
      `**SQL Query:**`,
      '```sql',
      query,
      '```',
      ``,
      `**Query Results (${data.length} rows):**`,
      '```json',
      JSON.stringify(data, null, 2),
      '```',
    ].join('\n');
  }
}

export const contextBuilderService = new ContextBuilderService();
