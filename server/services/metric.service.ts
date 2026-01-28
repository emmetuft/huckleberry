import dotenv from 'dotenv';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { neo4jService } from './neo4j.service.js';

dotenv.config();

interface UserMetric {
  metric: {
    id: string;
    name: string;
    description: string;
  };
  datasource: {
    id: string;
    properties: Record<string, any>;
  };
  query: string;
}

/**
 * Metric Service
 * Handles user metrics retrieval, matching, and datasource queries
 */
class MetricService {
  private model;
  private userMetricsCache: Map<string, { metrics: UserMetric[]; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.model = anthropic('claude-sonnet-4-20250514');
    this.userMetricsCache = new Map();
  }

  /**
   * Get metrics available to a user based on their department
   * Results are cached for 5 minutes per user
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
        m.name AS metricName,
        m.description AS metricDescription,
        ds.datasource_id AS datasourceId,
        properties(ds) AS datasourceProperties,
        qf.query AS query
    `;

    try {
      const results = await neo4jService.executeRead(cypherQuery, { userId });
      console.log('User Metrics Results:', results);

      const metrics = results.map((row: any) => ({
        metric: {
          id: row.metricId,
          name: row.metricName,
          description: row.metricDescription,
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
          `- ID: ${m.metric.id}\n  Name: ${m.metric.name}\n  Description: ${m.metric.description}`,
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
      console.log('Matched Metric Response:', trimmedResponse);
      return trimmedResponse === 'NONE' ? null : trimmedResponse;
    } catch (error) {
      console.error('Error matching question to metric:', error);
      return null;
    }
  }

  /**
   * Execute a SQL query against a datasource
   */
  async executeDatasourceQuery(
    datasource: { id: string; properties: Record<string, any> },
    query: string,
  ): Promise<any> {
    const url = `https://domo-es.domo.com/api/query/v1/execute/${datasource.id}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-DOMO-Developer-Token': process.env.DEV_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: query,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Datasource query failed with status ${response.status}: ${errorText}`,
        );
      }

      const result = (await response.json()) as { rows: any[] };
      console.log('Datasource Query Result:', result);
      return result.rows;
    } catch (error) {
      console.error('Error executing datasource query:', error);
      throw error;
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

      // Execute the datasource query
      const queryResult = await this.executeDatasourceQuery(
        matchedMetric.datasource,
        matchedMetric.query,
      );

      // Format the metric context
      const textContext = this.formatMetricContext(matchedMetric, queryResult);

      return {
        textContext,
        metadata: {
          metricId: matchedMetric.metric.id,
          metricName: matchedMetric.metric.name,
          matched: true,
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
  private formatMetricContext(
    metric: UserMetric,
    queryResult: any,
  ): string {
    let formatted = '# Metric Data\n\n';
    formatted += `**Metric:** ${metric.metric.name}\n`;
    formatted += `**Description:** ${metric.metric.description}\n\n`;
    formatted += `**Query Result:**\n`;
    formatted += `\`\`\`json\n${JSON.stringify(queryResult, null, 2)}\n\`\`\`\n`;
    return formatted;
  }
}

export const metricService = new MetricService();
