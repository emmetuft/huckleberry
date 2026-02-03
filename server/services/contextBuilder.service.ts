import { generateText, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  GraphContext,
  UserRequest,
} from '../../shared/models/interfaces/userRequest.ts';
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
} from '../constants/strategies.ts';
import { graphRagService } from './graphRag.service.js';
import { metricService } from './metric.service.js';
import { personaService } from './persona.service.js';
import { fileService } from './file.service.js';
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
  buildContext(userRequest: UserRequest): Promise<ContextResult>;
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

class ContextBuilderService {
  private model;
  private strategies: ContextStrategy[] = [];

  constructor() {
    this.model = anthropic('claude-sonnet-4-20250514');

    // Register available strategies (sorted by priority)
    this.registerStrategy(new PersonaStrategy());
    this.registerStrategy(new MetricStrategy());
    this.registerStrategy(new GraphRagStrategy());
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

    const { userInput } = userRequest;

    // Build strategy descriptions for the AI
    const strategyDescriptions = this.strategies
      .map((s) => `- ${s.name}: ${s.description}`)
      .join('\n');

    const prompt = CONTEXT_STRATEGY_PROMPT(strategyDescriptions, userInput);

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0,
      });

      const cleanedText = text.trim().replace(/```json\n?|\n?```/g, '');
      const selectedNames: string[] = JSON.parse(cleanedText);
      console.log('AI selected strategies:', selectedNames);

      const selected = this.strategies.filter((s) =>
        selectedNames.includes(s.name),
      );

      // Fallback: if no strategies selected or invalid response, use none
      return selected.length > 0 ? selected : [];
    } catch (error) {
      console.error('Error selecting strategies:', error);
      return [];
    }
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
        () => strategy.buildContext(userRequest),
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
