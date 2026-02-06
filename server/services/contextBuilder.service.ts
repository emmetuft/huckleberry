import { generateText, streamText } from 'ai';
import {
  GraphContext,
  UserRequest,
} from '../../shared/models/interfaces/userRequest.ts';
import { ContextResult } from '../../shared/models/interfaces/context.ts';
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
  DATASOURCE_DESCRIPTION,
} from '../constants/strategies.ts';
import { graphRagService } from './graphRag.service.js';
import { metricService } from './metric.service.js';
import { personaService } from './persona.service.js';
import { fileService } from './file.service.js';
import { mcpToolService } from './mcpTool.service.js';
import { datasourceService } from './datasource.service.js';
import { stripCodeBlockMarkers } from '../utils/aiResponse.js';
import {
  StepType,
  StepTypeTitles,
} from '../../shared/models/enums/stepType.ts';

interface ContextStrategy {
  name: string;
  description: string;
  priority: number;
  buildContext(
    userRequest: UserRequest,
    emitEvent?: (event: any) => void,
  ): Promise<ContextResult>;
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
  priority = 2;

  async buildContext(
    userRequest: UserRequest,
    emitEvent?: (event: any) => void,
  ): Promise<ContextResult> {
    const { textContext, metadata } = await mcpToolService.buildMcpToolContext(
      userRequest,
      emitEvent,
    );

    return {
      textContext,
      metadata: {
        strategy: this.name,
        ...metadata,
      },
    };
  }
}

class DatasourceStrategy implements ContextStrategy {
  name = ContextStrategyType.DATASOURCE;
  description = DATASOURCE_DESCRIPTION;
  priority = 2;

  async buildContext(
    userRequest: UserRequest,
    emitEvent?: (event: any) => void,
  ): Promise<ContextResult> {
    return datasourceService.buildDatasourceContext(userRequest, emitEvent);
  }
}

class ContextBuilderService {
  private model;
  private strategies: ContextStrategy[] = [];

  constructor() {
    this.model = models.contextBuilder;

    this.registerStrategy(new GraphRagStrategy());
    this.registerStrategy(new MetricStrategy());
    this.registerStrategy(new PersonaStrategy());
    this.registerStrategy(new MCPToolStrategy());
    this.registerStrategy(new DatasourceStrategy());
  }

  registerStrategy(strategy: ContextStrategy): void {
    this.strategies.push(strategy);
    // Sort by priority (higher priority first)
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Auto-include a strategy if user provided specific items
   */
  private autoIncludeStrategy(
    strategyType: ContextStrategyType,
    selected: ContextStrategy[],
    items: any[] | undefined,
  ): void {
    if (items && items.length > 0) {
      const strategy = this.strategies.find((s) => s.name === strategyType);
      if (strategy && !selected.includes(strategy)) {
        console.log(`[Strategy Selection] Auto-including ${strategyType}`);
        selected.push(strategy);
      }
    }
  }

  /**
   * Use AI to intelligently select which strategies should be used for this request
   */
  private async selectStrategies(
    userRequest: UserRequest,
  ): Promise<ContextStrategy[]> {
    const { userInput, tools, dataSources } = userRequest;

    const strategyDescriptions = this.strategies
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

      const cleanedText = stripCodeBlockMarkers(text);
      const selectedNames: string[] = JSON.parse(cleanedText);
      selected = this.strategies.filter((s) => selectedNames.includes(s.name));
    } catch (error) {
      console.error('Error selecting strategies:', error);
    }

    // Auto-include strategies if user provided specific items
    this.autoIncludeStrategy(ContextStrategyType.MCP_TOOL, selected, tools);
    this.autoIncludeStrategy(
      ContextStrategyType.DATASOURCE,
      selected,
      dataSources,
    );

    console.log(
      `[Strategy Selection] Final strategies:`,
      selected.map((s) => s.name),
    );
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
      {
        id: StepType.ANALYZE_REQUEST,
        title: StepTypeTitles[StepType.ANALYZE_REQUEST],
      },
      () => this.selectStrategies(userRequest),
      emitEvent,
      (strategies) => ({
        strategyName: strategies.map((s) => s.name).toString(),
      }),
    );

    // 2. Run strategies in parallel
    const results = await Promise.all(
      strategiesToRun.map((s) => this.runStrategy(s, userRequest, emitEvent)),
    );

    // 3. Generate response
    const { textContext, graphContext } = this.mergeContextResults(results);

    emitEvent({ type: StreamType.METADATA, context: graphContext });

    const messages = this.buildMessages(textContext, userRequest);

    emitEvent({
      type: StreamType.STEP_START,
      step: {
        id: StepType.GENERATE_RESPONSE,
        title: StepTypeTitles[StepType.GENERATE_RESPONSE],
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
        id: StepType.GENERATE_RESPONSE,
        title: StepTypeTitles[StepType.GENERATE_RESPONSE],
        status: StreamStatus.COMPLETE,
      },
    });

    return {
      textStream: result.textStream,
    };
  }

  async runStep<T>(
    step: { id: string; title: string },
    work: () => Promise<T>,
    emitEvent?: (event: any) => void,
    details?: (result: T) => any,
  ): Promise<T> {
    emitEvent?.({
      type: StreamType.STEP_START,
      step: { ...step, status: StreamStatus.IN_PROGRESS },
    });

    try {
      const result = await work();

      emitEvent?.({
        type: StreamType.STEP_COMPLETE,
        step: {
          ...step,
          status: StreamStatus.COMPLETE,
          details: details?.(result),
        },
      });

      return result;
    } catch (error) {
      emitEvent?.({
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
    const skipEvents = [
      ContextStrategyType.MCP_TOOL,
      ContextStrategyType.DATASOURCE,
    ].includes(strategy.name as ContextStrategyType);

    try {
      return await this.runStep(
        { id: stepId, title },
        () => strategy.buildContext(userRequest, emitEvent),
        skipEvents ? undefined : emitEvent,
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
}

export const contextBuilderService = new ContextBuilderService();
