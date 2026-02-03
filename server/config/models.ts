import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

/**
 * Centralized AI Model Configuration
 *
 * Configure models for each service in one place.
 * Uncomment the model you want to use for each service.
 */

const anthropicModel = anthropic('claude-sonnet-4-20250514');
const googleGeminiModel = google('gemini-1.5-pro');
const openaiModel = openai('gpt-4o-mini');

export const models = {
  // Context Builder Service - Used for strategy selection and response generation
  contextBuilder: openaiModel,

  // Metric Service - Used for matching questions to metrics and generating time filters
  metric: openaiModel,

  // Graph RAG Service - Used for schema identification and Cypher query generation
  graphRag: openaiModel,

  // Datasource Service - Used for SQL query generation
  datasource: openaiModel,

  // Fast model - Used for quick tasks like parameter generation
  fast: openaiModel,
};
