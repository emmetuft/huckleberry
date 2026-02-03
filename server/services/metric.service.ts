import dotenv from 'dotenv';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { neo4jService } from './neo4j.service.js';
import { datasourceService } from './datasource.service.js';
import { GraphContext } from '../../shared/models/interfaces/userRequest.ts';
import { TimeFilter } from '../../shared/models/interfaces/filters.ts';
import {
  buildWhereClause,
  addTimeColumnToSelect,
  addWhereClauseToQuery,
} from '../utils/sql.ts';

dotenv.config();

interface UserMetric {
  metric: {
    id: string;
    properties: Record<string, any>;
  };
  datasource: {
    id: string;
    properties: Record<string, any>;
  };
  query: string;
}

/**
 * Metric Service
 * Handles user metrics retrieval and matching
 */
class MetricService {
  private model;
  private userMetricsCache: Map<
    string,
    { metrics: UserMetric[]; timestamp: number }
  >;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.model = anthropic('claude-sonnet-4-20250514');
    this.userMetricsCache = new Map();
  }

  /**
   * Get metrics available to a user based on their department
   */
  async getUserMetrics(userId: string): Promise<UserMetric[]> {
    // Check cache first
    const cached = this.userMetricsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('Using cached user metrics for user:', userId);
      return cached.metrics;
    }

    const cypherQuery = `
      MATCH (p:Person {id: $userId})-[:WORKS_IN]->(d:Department)
      MATCH (d)-[:OWNS_METRIC]->(m:Metric)
      MATCH (m)-[qf:QUERIES_FROM]->(ds:Datasource)
      RETURN
        m.metric_id AS metricId,
        properties(m) AS metricProperties,
        ds.datasource_id AS datasourceId,
        properties(ds) AS datasourceProperties,
        qf.query AS query
    `;

    try {
      const results = await neo4jService.executeRead(cypherQuery, { userId });

      const metrics = results.map((row: any) => ({
        metric: {
          id: row.metricId,
          properties: row.metricProperties,
        },
        datasource: {
          id: row.datasourceId,
          properties: row.datasourceProperties,
        },
        query: row.query,
      }));

      // Cache the results
      this.userMetricsCache.set(userId, {
        metrics,
        timestamp: Date.now(),
      });

      return metrics;
    } catch (error) {
      console.error('Error getting user metrics:', error);
      return [];
    }
  }

  /**
   * Use LLM to determine if user question matches any available metrics
   */
  async matchQuestionToMetric(
    userInput: string,
    metrics: UserMetric[],
  ): Promise<string | null> {
    if (metrics.length === 0) {
      return null;
    }

    const metricsContext = metrics
      .map(
        (m) =>
          `- ID: ${m.metric.id}\n  Name: ${m.metric.properties.name}\n  Description: ${m.metric.properties.description}`,
      )
      .join('\n');

    const prompt = `You are analyzing a user's question to determine if they are asking about a specific metric.

Available metrics:
${metricsContext}

User question: "${userInput}"

If the user's question is asking about one of the available metrics, respond with ONLY the metric ID.
If the question does not match any metric, respond with ONLY the word "NONE".

You must pick the most likely metric if there is any reasonable match. Do not respond with "NONE" unless the question clearly has nothing to do with any of the metrics.

Response:`;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0,
      });

      const trimmedResponse = text.trim();
      return trimmedResponse === 'NONE' ? null : trimmedResponse;
    } catch (error) {
      console.error('Error matching question to metric:', error);
      return null;
    }
  }

  /**
   * Use AI to generate time filter from user request and metric time properties
   */
  async generateTimeFilter(
    userInput: string,
    timeColumn: string,
    timeGrain: string,
    timeType: 'event_time' | 'snapshot',
  ): Promise<TimeFilter | null> {
    const prompt = `You are analyzing a user's question to determine what time range they are asking about.

Metric time properties:
- Time column: ${timeColumn}
- Time grain: ${timeGrain}
- Time type: ${timeType}

User question: "${userInput}"

Based on the user's question, generate a time filter object with these fields:
- start (optional): ISO date string (YYYY-MM-DD) for the start of the range
- end (optional): ISO date string (YYYY-MM-DD) for the end of the range
- grain (optional): time granularity (day, week, month, quarter, year)
- operator (required): one of "between", "gt", "gte", "lt", "lte", "equals"

Rules:
1. If the user mentions a specific date range, use "between" with start and end
2. If the user mentions "last X days/weeks/months", calculate the date range
3. If the user mentions "since X", use "gte" with start date
4. If the user mentions "before X", use "lt" with end date
5. If the user mentions a specific date, use "equals" with start date
6. Use today's date (${new Date().toISOString().split('T')[0]}) as reference for relative dates
7. If no time information is mentioned, return null

Respond with ONLY a valid JSON object or the word "null".

Response:`;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0,
      });

      const trimmedResponse = text.trim();
      if (trimmedResponse === 'null') {
        return null;
      }

      const cleanedText = trimmedResponse.replace(/```json\n?|\n?```/g, '');
      const timeFilter: TimeFilter = JSON.parse(cleanedText);

      return timeFilter;
    } catch (error) {
      console.error('Error generating time filter:', error);
      return null;
    }
  }

  /**
   * Invalidate the cache for a specific user (useful after metrics are updated)
   */
  invalidateUserMetricsCache(userId: string): void {
    this.userMetricsCache.delete(userId);
  }

  /**
   * Clear all cached user metrics
   */
  clearCache(): void {
    this.userMetricsCache.clear();
  }

  /**
   * Build metric context for a user request
   * Returns formatted text context if a metric is matched, empty string otherwise
   */
  async buildMetricContext(
    userInput: string,
    userId: string,
  ): Promise<{
    textContext: string;
    graphContext?: GraphContext;
    metadata: Record<string, any>;
  }> {
    try {
      // Get user's available metrics (cached)
      const userMetrics = await this.getUserMetrics(userId);

      if (userMetrics.length === 0) {
        return {
          textContext: '',
          metadata: {
            metricsAvailable: 0,
          },
        };
      }

      // Check if the question matches any metric
      const matchedMetricId = await this.matchQuestionToMetric(
        userInput,
        userMetrics,
      );

      if (!matchedMetricId) {
        return {
          textContext: '',
          metadata: {
            metricsAvailable: userMetrics.length,
            matched: false,
          },
        };
      }

      // Find the matched metric
      const matchedMetric = userMetrics.find(
        (m) => m.metric.id === matchedMetricId,
      );

      if (!matchedMetric) {
        return {
          textContext: '',
          metadata: {
            matched: false,
          },
        };
      }

      // Build the SQL query with time filtering if applicable
      let finalQuery = matchedMetric.query;
      let timeFilter: TimeFilter | null = null;

      const { time_column, time_grain, time_type } =
        matchedMetric.metric.properties;

      if (time_column && time_grain && time_type) {
        // Add time column to SELECT if not already present
        finalQuery = addTimeColumnToSelect(finalQuery, time_column);

        // Generate time filter based on user input
        timeFilter = await this.generateTimeFilter(
          userInput,
          time_column,
          time_grain,
          time_type,
        );

        if (timeFilter) {
          const whereClause = buildWhereClause(timeFilter, time_column);
          // Add WHERE clause to query
          finalQuery = addWhereClauseToQuery(finalQuery, whereClause);
        }
      }

      // Execute the datasource query
      const queryResult = await datasourceService.executeDatasourceQuery(
        matchedMetric.datasource.id,
        finalQuery,
      );

      console.log('Datasource query result:', queryResult);

      // Format the metric context
      const textContext = this.formatMetricContext(matchedMetric, queryResult);

      // Build graph context with metric node and query data
      const graphContext = {
        nodes: [
          {
            id: matchedMetric.metric.id,
            labels: ['Metric'],
            properties: {
              ...matchedMetric.metric.properties,
              queryData: queryResult,
            },
          },
        ],
        relationships: [],
      };

      return {
        textContext,
        graphContext,
        metadata: {
          metricId: matchedMetric.metric.id,
          metricName: matchedMetric.metric.properties.name,
          matched: true,
          timeFilter: timeFilter || undefined,
        },
      };
    } catch (error) {
      console.error('Error building metric context:', error);
      return {
        textContext: '',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Format metric data into readable context for the LLM
   */
  private formatMetricContext(metric: UserMetric, queryResult: any): string {
    let formatted = '# Metric Data\n\n';
    formatted += `**Metric:** ${metric.metric.properties.name}\n`;
    formatted += `**Description:** ${metric.metric.properties.description}\n\n`;
    formatted += `**Query Result:**\n`;
    formatted += `\`\`\`json\n${JSON.stringify(queryResult, null, 2)}\n\`\`\`\n`;
    return formatted;
  }
}

export const metricService = new MetricService();
