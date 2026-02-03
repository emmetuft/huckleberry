import dotenv from 'dotenv';
import { generateText } from 'ai';
import { models } from '../config/models.js';

dotenv.config();

const BASE_URL = process.env.DOMO_INSTANCE_URL || 'https://domo-es.domo.com';

/**
 * Datasource Service
 * Handles datasource query execution and schema retrieval
 */
class DatasourceService {
  private model;

  constructor() {
    this.model = models.datasource;
  }

  /**
   * Execute a SQL query against a datasource
   */
  async executeDatasourceQuery(
    datasourceId: string,
    query: string,
  ): Promise<any> {
    const url = `${BASE_URL}/api/query/v1/execute/${datasourceId}`;

    console.log('Executing SQL query:', query);

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

      const result = (await response.json()) as {
        columns: string[];
        rows: any[][];
      };

      const formattedRows = result.rows.map((row) => {
        const rowObj: Record<string, any> = {};
        result.columns.forEach((columnName, index) => {
          rowObj[columnName] = row[index];
        });
        return rowObj;
      });

      return formattedRows;
    } catch (error) {
      console.error('Error executing datasource query:', error);
      throw error;
    }
  }

  /**
   * Fetch the schema of a datasource
   */
  async getDatasourceSchema(datasourceId: string): Promise<any> {
    const url = `${BASE_URL}/api/data/v2/datasources/${datasourceId}/schemas/latest`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-DOMO-Developer-Token': process.env.DEV_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Datasource schema fetch failed with status ${response.status}: ${errorText}`,
        );
      }

      const schema = await response.json();
      return schema;
    } catch (error) {
      console.error('Error fetching datasource schema:', error);
      throw error;
    }
  }

  /**
   * Generate SQL query based on user input and datasource schema using AI
   */
  private async generateSQLQuery(
    userInput: string,
    schema: any,
  ): Promise<string> {
    const prompt = `You are a SQL query generator. Based on the user's question and the provided datasource schema, generate a SQL query that will help answer their question.

Datasource Schema:
${JSON.stringify(schema, null, 2)}

User Question: "${userInput}"

Rules:
1. Generate a valid SQL query that retrieves relevant data to answer the user's question
2. Use appropriate WHERE clauses, aggregations, and JOINs as needed
3. Limit results to a reasonable number (e.g., LIMIT 100) unless the user asks for all data
4. Only use columns that exist in the schema
5. Return ONLY the SQL query, no explanations or markdown formatting

SQL Query:`;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0,
      });

      return text.trim();
    } catch (error) {
      console.error('Error generating SQL query:', error);
      throw error;
    }
  }

  /**
   * Query a datasource by fetching its schema, generating an appropriate SQL query,
   * and executing it to retrieve data that helps answer the user's question
   */
  async queryDatasource(
    userInput: string,
    datasource: { id: string; [key: string]: any },
  ): Promise<{
    data: any[];
    query: string;
    schema: any;
  }> {
    try {
      // Fetch the datasource schema
      const schema = await this.getDatasourceSchema(datasource.id);
      console.log('Fetched datasource schema:', schema);

      // Generate SQL query based on user input and schema
      const sqlQuery = await this.generateSQLQuery(userInput, schema);
      console.log('Generated SQL query:', sqlQuery);

      // Execute the generated query
      const data = await this.executeDatasourceQuery(datasource.id, sqlQuery);
      console.log('Retrieved data from datasource:', data);

      return {
        data,
        query: sqlQuery,
        schema,
      };
    } catch (error) {
      console.error('Error querying datasource:', error);
      throw error;
    }
  }
}

export const datasourceService = new DatasourceService();
