import { generateText, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  GraphContext,
  SystemResponse,
  UserRequest,
} from '../../shared/models/interfaces/userRequest.ts';
import {
  CONTEXT_STRATEGY_PROMPT,
  GRAPH_RAG_PROMPT,
} from '../constants/prompts.ts';
import { graphRagService } from './graphRag.service.js';
import { metricService } from './metric.service.js';

interface ContextResult {
  textContext: string;
  graphContext?: GraphContext;
  metadata: {
    strategyUsed: string;
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
  name = 'graph-rag';
  description =
    'Queries the knowledge graph for entities and relationships (e.g., people, departments, connections)';
  priority = 1;

  async buildContext(userRequest: UserRequest): Promise<ContextResult> {
    const { context, formattedContext, cypherQuery } =
      await graphRagService.retrieveGraphContext(userRequest);

    return {
      textContext: formattedContext,
      graphContext: context,
      metadata: {
        strategyUsed: this.name,
        cypherQuery,
      },
    };
  }
}

class MetricStrategy implements ContextStrategy {
  name = 'metric';
  description =
    'Retrieves pre-defined metrics and their data values (e.g., revenue, sales numbers)';
  priority = 2;

  async buildContext(userRequest: UserRequest): Promise<ContextResult> {
    const { userInput, userId } = userRequest;

    const { textContext, metadata } = await metricService.buildMetricContext(
      userInput,
      userId,
    );

    return {
      textContext,
      metadata: {
        strategyUsed: this.name,
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

      // Filter to only selected strategies
      const selected = this.strategies.filter((s) =>
        selectedNames.includes(s.name),
      );

      // Fallback: if no strategies selected or invalid response, use all
      return selected.length > 0 ? selected : this.strategies;
    } catch (error) {
      console.error('Error selecting strategies, using all:', error);
      return this.strategies;
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

    console.log(
      'Strategies to run:',
      strategiesToRun.map((s) => s.name),
    );

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
  private mergeContextResults(results: ContextResult[]): {
    mergedTextContext: string;
    graphContext: GraphContext;
    metadata: any;
  } {
    if (results.length === 0) {
      throw new Error('No context results to merge');
    }

    let mergedTextContext = '';
    let graphContext: GraphContext = { nodes: [], relationships: [] };
    const metadata: any = {
      strategiesUsed: results.map((r) => r.metadata.strategyUsed),
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
        if (key !== 'strategyUsed') {
          metadata[key] = result.metadata[key];
        }
      });
    });

    return {
      mergedTextContext,
      graphContext,
      metadata,
    };
  }

  private buildPrompt(
    mergedTextContext: string,
    userRequest: UserRequest,
  ): string {
    return `${mergedTextContext}

User input: ${userRequest.userInput}

Please address the request based on the context provided above.`;
  }

  async query(userRequest: UserRequest): Promise<SystemResponse> {
    // Build context from all applicable strategies in parallel
    const contextResults = await this.buildContextParallel(userRequest);

    // Merge all context results
    const { mergedTextContext, graphContext, metadata } =
      this.mergeContextResults(contextResults);

    // Build prompt
    const userPrompt = this.buildPrompt(mergedTextContext, userRequest);

    try {
      const { text } = await generateText({
        model: this.model,
        system: GRAPH_RAG_PROMPT,
        prompt: userPrompt,
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

  async queryStream(userRequest: UserRequest) {
    // Build context from all applicable strategies in parallel
    const contextResults = await this.buildContextParallel(userRequest);

    // Merge all context results
    const { mergedTextContext, graphContext, metadata } =
      this.mergeContextResults(contextResults);

    // Build prompt
    const userPrompt = this.buildPrompt(mergedTextContext, userRequest);

    try {
      const result = await streamText({
        model: this.model,
        system: GRAPH_RAG_PROMPT,
        prompt: userPrompt,
        temperature: 0.7,
      });

      return {
        textStream: result.textStream,
        context: graphContext,
      };
    } catch (error) {
      console.error('Error streaming answer:', error);
      throw error;
    }
  }
}

export const contextBuilderService = new ContextBuilderService();
