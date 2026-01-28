import dotenv from 'dotenv';
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import neo4j from 'neo4j-driver';
import { neo4jService } from './neo4j.service.js';
import {
  GraphContext,
  SystemResponse,
  UserRequest,
} from '../../shared/models/interfaces/userRequest.ts';
import {
  CYPHER_GENERATION_PROMPT,
  GRAPH_RAG_PROMPT,
  SCHEMA_IDENTIFICATION_PROMPT,
} from '../constants/prompts.ts';
import { parseResponseData } from '../utils/neo4j.ts';

dotenv.config();

class GraphRagService {
  private model;

  constructor() {
    this.model = anthropic('claude-sonnet-4-20250514');
    // this.model = openai('gpt-4o-mini');
  }

  /**
   * Step 1: Identify relevant schema elements (nodes, relationships, properties)
   */
  private async identifyRelevantSchema(
    userInput: string,
    schema: any,
  ): Promise<{
    nodes: Record<string, string[]>;
    relationships: Record<string, string[]>;
  }> {
    const prompt =
      SCHEMA_IDENTIFICATION_PROMPT.replace('{schema}', JSON.stringify(schema)) +
      `\n\nUser question: ${userInput}\n\nJSON response:`;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0,
      });

      // Parse the JSON response
      const cleanedText = text.trim().replace(/```json\n?|\n?```/g, '');
      const result = JSON.parse(cleanedText);

      return {
        nodes: result.nodes || {},
        relationships: result.relationships || {},
      };
    } catch (error) {
      console.error('Error identifying relevant schema:', error);
      throw error;
    }
  }

  /**
   * Step 2: Get actual property values from the database
   */
  private async getPropertyValues(
    relevantSchema: {
      nodes: Record<string, string[]>;
      relationships: Record<string, string[]>;
    },
    limit: number = 20,
  ): Promise<Record<string, any>> {
    const propertyValues: Record<string, any> = {};

    // Get values for node properties
    for (const [nodeLabel, properties] of Object.entries(
      relevantSchema.nodes,
    )) {
      for (const property of properties) {
        const key = `${nodeLabel}.${property}`;

        // First, check the data type and get sample values
        const typeQuery = `
          MATCH (n:${nodeLabel})
          WHERE n.${property} IS NOT NULL
          WITH n.${property} AS value
          RETURN
            value,
            apoc.meta.cypher.type(value) AS type
          LIMIT 1
        `;

        try {
          const typeResult = await neo4jService.executeRead(typeQuery, {});

          if (typeResult.length === 0) {
            continue;
          }

          const valueType = typeResult[0].type;

          // For string types, get distinct values
          if (valueType === 'STRING') {
            const valuesQuery = `
              MATCH (n:${nodeLabel})
              WHERE n.${property} IS NOT NULL
              RETURN n.${property} AS value, count(*) AS count
              ORDER BY count DESC
              LIMIT ${limit}
            `;

            const valuesResult = await neo4jService.executeRead(
              valuesQuery,
              {},
            );
            propertyValues[key] = valuesResult.map((r) => r.value);
          } else {
            // For numeric/date types, get min/max and sample
            const statsQuery = `
              MATCH (n:${nodeLabel})
              WHERE n.${property} IS NOT NULL
              RETURN
                min(n.${property}) AS min,
                max(n.${property}) AS max,
                apoc.meta.cypher.type(n.${property}) AS type
            `;

            const statsResult = await neo4jService.executeRead(statsQuery, {});
            if (statsResult.length > 0) {
              propertyValues[key] = {
                type: valueType,
                min: statsResult[0].min,
                max: statsResult[0].max,
              };
            }
          }
        } catch (error) {
          console.error(`Error getting values for ${key}:`, error);
          // Continue with other properties even if one fails
        }
      }
    }

    // Get values for relationship properties
    for (const [relType, properties] of Object.entries(
      relevantSchema.relationships,
    )) {
      for (const property of properties) {
        const key = `${relType}.${property}`;

        // Similar logic for relationships
        const typeQuery = `
          MATCH ()-[r:${relType}]->()
          WHERE r.${property} IS NOT NULL
          WITH r.${property} AS value
          RETURN
            value,
            apoc.meta.cypher.type(value) AS type
          LIMIT 1
        `;

        try {
          const typeResult = await neo4jService.executeRead(typeQuery, {});

          if (typeResult.length === 0) {
            continue;
          }

          const valueType = typeResult[0].type;

          if (valueType === 'STRING') {
            const valuesQuery = `
              MATCH ()-[r:${relType}]->()
              WHERE r.${property} IS NOT NULL
              RETURN r.${property} AS value, count(*) AS count
              ORDER BY count DESC
              LIMIT ${limit}
            `;

            const valuesResult = await neo4jService.executeRead(
              valuesQuery,
              {},
            );
            propertyValues[key] = valuesResult.map((r) => r.value);
          } else {
            const statsQuery = `
              MATCH ()-[r:${relType}]->()
              WHERE r.${property} IS NOT NULL
              RETURN
                min(r.${property}) AS min,
                max(r.${property}) AS max,
                apoc.meta.cypher.type(r.${property}) AS type
            `;

            const statsResult = await neo4jService.executeRead(statsQuery, {});
            if (statsResult.length > 0) {
              propertyValues[key] = {
                type: valueType,
                min: statsResult[0].min,
                max: statsResult[0].max,
              };
            }
          }
        } catch (error) {
          console.error(`Error getting values for ${key}:`, error);
        }
      }
    }

    return propertyValues;
  }

  /**
   * Step 3: Generate Cypher query with enriched context
   */
  async generateCypherFromText(userInput: string): Promise<string> {
    // Step 1: Get the graph schema
    const schema = await neo4jService.getGraphSchema();

    // Step 2: Identify relevant schema elements
    const relevantSchema = await this.identifyRelevantSchema(userInput, schema);
    console.log('Relevant Schema:', relevantSchema);

    // Step 3: Get actual property values from the database
    const propertyValues = await this.getPropertyValues(relevantSchema);

    // Step 4: Generate the Cypher query with all context
    const prompt = CYPHER_GENERATION_PROMPT.replace(
      '{schema}',
      JSON.stringify(schema),
    )
      .replace('{propertyValues}', JSON.stringify(propertyValues, null, 2))
      .concat(`\n\nUser input: ${userInput}\n\nCypher query:`);

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0,
      });
      console.log('Generated Cypher Query:', text);

      return text.trim();
    } catch (error) {
      console.error('Error generating Cypher query:', error);
      throw error;
    }
  }

  /**
   * Retrieve relevant graph context based on the question
   */
  async retrieveGraphContext(userRequest: UserRequest): Promise<{
    context: GraphContext;
    formattedContext: string;
    cypherQuery: string;
  }> {
    const { userInput } = userRequest;

    // Generate Cypher query from user input
    const cypherQuery: string = await this.generateCypherFromText(userInput);
    const params: Record<string, any> = {
      maxNodes: neo4j.int(1000),
      depth: neo4j.int(100),
    };

    try {
      const results = await neo4jService.executeRead(cypherQuery, params);
      const { nodes, relationships } = parseResponseData(results);

      const context = {
        nodes,
        relationships,
      };
      const formattedContext = this.formatGraphContext(context, cypherQuery);

      return {
        context,
        formattedContext,
        cypherQuery,
      };
    } catch (error) {
      console.error('Error retrieving graph context:', error);
      throw error;
    }
  }

  /**
   * Format graph context into a readable string for the LLM
   * Public method so ContextBuilderService can use it
   */
  formatGraphContext(
    context: GraphContext,
    cypherQuery: string,
    metricResult?: any,
  ): string {
    const { nodes, relationships } = context;

    let formatted = '# Graph Context\n\n';

    formatted += `**Cypher Query Used:**\n\`\`\`cypher\n${cypherQuery}\n\`\`\`\n\n`;

    formatted += `## Nodes (${nodes.length}):\n`;
    nodes.forEach((node) => {
      formatted += `- Node ${node.id} [${node.labels.join(', ')}]\n`;
      if (Object.keys(node.properties).length > 0) {
        formatted += `  Properties: ${JSON.stringify(node.properties, null, 2)}\n`;
      }
    });

    formatted += `\n## Relationships (${relationships.length}):\n`;
    relationships.forEach((rel) => {
      formatted += `- ${rel.source} -[${rel.type}]-> ${rel.target}\n`;
      if (Object.keys(rel.properties).length > 0) {
        formatted += `  Properties: ${JSON.stringify(rel.properties, null, 2)}\n`;
      }
    });

    // Add metric result if available
    if (metricResult) {
      formatted += `\n## Metric Query Result:\n${JSON.stringify(metricResult, null, 2)}\n`;
    }

    return formatted;
  }
}

export const graphRagService = new GraphRagService();
