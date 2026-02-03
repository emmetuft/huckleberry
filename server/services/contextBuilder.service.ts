import { generateText, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  GraphContext,
  SystemResponse,
  UserRequest,
} from '../../shared/models/interfaces/userRequest.ts';
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
import {
  ContextStrategyType,
  STRATEGY_EXP_MAP,
} from '../../shared/models/enums/contextStrategy.ts';
import { StreamStatus, StreamType } from '../../shared/models/enums/stream.ts';

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
   * Build context by running multiple strategies in parallel
   */
  private async buildContextParallel(
    userRequest: UserRequest,
  ): Promise<ContextResult[]> {
    // Use AI to intelligently select which strategies to run
    const strategiesToRun = await this.selectStrategies(userRequest);

    // Run all selected strategies in parallel
    const results = await Promise.all(
      strategiesToRun.map((strategy) => strategy.buildContext(userRequest)),
    );

    console.log('Context results from strategies:', results);

    return results;
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

  async query(userRequest: UserRequest): Promise<SystemResponse> {
    // Build context from all applicable strategies in parallel
    const contextResults = await this.buildContextParallel(userRequest);

    // Merge all context results
    const { textContext, graphContext, metadata } =
      this.mergeContextResults(contextResults);

    // Build messages with files
    const messages = this.buildMessages(textContext, userRequest);

    try {
      const { text } = await generateText({
        model: this.model,
        system: ULTIMATE_PROMPT,
        messages,
        temperature: 0.7,
      });

      return {
        output: text,
        context: graphContext,
      };
    } catch (error) {
      console.error('Error generating answer:', error);
      throw error;
    }
  }

  async queryStream(userRequest: UserRequest, emitEvent: (event: any) => void) {
    try {
      // Step 1: Analyzing request
      const step1Id = 'analyze-request';
      emitEvent({
        type: StreamType.STEP_START,
        step: {
          id: step1Id,
          title: 'Analyzing your request',
          status: StreamStatus.IN_PROGRESS,
        },
      });

      // Use AI to intelligently select which strategies to run
      const strategiesToRun = await this.selectStrategies(userRequest);

      emitEvent({
        type: StreamType.STEP_COMPLETE,
        step: {
          id: step1Id,
          title: 'Analyzing your request',
          status: StreamStatus.COMPLETE,
          details: {
            selectedStrategies: strategiesToRun.map((s) => s.name),
          },
        },
      });

      // Run strategies and emit progress for each
      const results: ContextResult[] = [];
      for (const strategy of strategiesToRun) {
        const stepId = `strategy-${strategy.name}`;
        emitEvent({
          type: StreamType.STEP_START,
          step: {
            id: stepId,
            title: STRATEGY_EXP_MAP[strategy.name as ContextStrategyType],
            status: StreamStatus.IN_PROGRESS,
          },
        });

        const result = await strategy.buildContext(userRequest);
        results.push(result);

        // Emit step completion with strategy-specific details
        emitEvent({
          type: StreamType.STEP_COMPLETE,
          step: {
            id: stepId,
            title: STRATEGY_EXP_MAP[strategy.name as ContextStrategyType],
            status: StreamStatus.COMPLETE,
            details: {
              strategyName: strategy.name,
              graphContext: result.graphContext,
              metadata: result.metadata,
            },
          },
        });
      }

      // Step: Generating response
      const step4Id = 'generate-response';
      emitEvent({
        type: StreamType.STEP_START,
        step: {
          id: step4Id,
          title: 'Generating response',
          status: StreamStatus.IN_PROGRESS,
        },
      });

      // Merge all context results
      const { textContext, graphContext, metadata } =
        this.mergeContextResults(results);

      // Send final graph context as metadata
      emitEvent({
        type: 'metadata',
        context: graphContext,
      });

      // Build messages with files
      const messages = this.buildMessages(textContext, userRequest);

      // Stream the text response
      const result = await streamText({
        model: this.model,
        system: ULTIMATE_PROMPT,
        messages,
        temperature: 0.7,
      });

      return {
        textStream: result.textStream,
      };
    } catch (error) {
      console.error('Error streaming answer:', error);
      throw error;
    }
  }
}

export const contextBuilderService = new ContextBuilderService();
