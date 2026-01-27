import neo4j, { Driver, Session, session } from 'neo4j-driver';
import dotenv from 'dotenv';
import { parseSchemaData, toNativeTypes } from '../utils/neo4j.ts';

dotenv.config();

class Neo4jService {
  private driver: Driver | null = null;
  private readonly uri: string;
  private readonly username: string;
  private readonly password: string;
  private schemaCache: { nodes: any[]; relationships: any[] } | null = null;
  private schemaCacheTimestamp: number = 0;
  private readonly SCHEMA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    this.username = process.env.NEO4J_USERNAME || 'neo4j';
    this.password = process.env.NEO4J_PASSWORD || 'password';
  }

  /**
   * Initialize the Neo4j driver connection
   */
  async connect(): Promise<void> {
    try {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.username, this.password),
        {
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 60000, // 60 seconds
          maxConnectionLifetime: 3600000, // 1 hour
          connectionTimeout: 30000, // 30 seconds
          // Keep connections alive to avoid cold starts
          maxTransactionRetryTime: 30000,
        }
      );

      // Verify connectivity
      await this.driver.verifyConnectivity();
      console.log('✅ Connected to Neo4j database');
    } catch (error) {
      console.error('❌ Failed to connect to Neo4j:', error);
      throw error;
    }
  }

  /**
   * Get a read session
   */
  getReadSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session({
      defaultAccessMode: session.READ,
      database: process.env.NEO4J_DATABASE,
    });
  }

  /**
   * Get a write session
   */
  getWriteSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session({
      defaultAccessMode: session.WRITE,
      database: process.env.NEO4J_DATABASE,
    });
  }
  /**
   * Execute a read query
   */
  async executeRead<T = any>(
    cypher: string,
    params: Record<string, any> = {},
  ): Promise<T[]> {
    const currSession = this.getReadSession();
    try {
      const result = await currSession.executeRead((tx) =>
        tx.run(cypher, params),
      );
      return result.records.map((record) =>
        toNativeTypes(record.toObject()),
      ) as T[];
    } finally {
      await currSession.close();
    }
  }

  /**
   * Execute a write query
   */
  async executeWrite<T = any>(
    cypher: string,
    params: Record<string, any> = {},
  ): Promise<T[]> {
    const currSession = this.getWriteSession();
    try {
      const result = await currSession.executeWrite((tx) =>
        tx.run(cypher, params),
      );
      return result.records.map((record) =>
        toNativeTypes(record.toObject()),
      ) as T[];
    } finally {
      await currSession.close();
    }
  }

  /**
   * Close the driver connection
   */
  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log('Disconnected from Neo4j');
    }
  }

  /**
   * Get the driver instance (for advanced usage)
   */
  getDriver(): Driver {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver;
  }

  /**
   * Get the graph schema including node and relationship properties
   * Uses caching to avoid expensive schema queries on every request
   */
  async getGraphSchema(): Promise<{
    nodes: any[];
    relationships: any[];
  }> {
    const now = Date.now();

    // Return cached schema if still valid
    if (this.schemaCache && (now - this.schemaCacheTimestamp) < this.SCHEMA_CACHE_TTL) {
      return this.schemaCache;
    }

    // Fetch fresh schema
    const [nodeProperties, relationshipProperties] = await Promise.all([
      this.executeRead('CALL db.schema.nodeTypeProperties()'),
      this.executeRead('CALL db.schema.relTypeProperties()'),
    ]);

    const schema = parseSchemaData(nodeProperties, relationshipProperties);

    // Update cache
    this.schemaCache = schema;
    this.schemaCacheTimestamp = now;

    return schema;
  }

  /**
   * Invalidate the schema cache (call this after schema changes)
   */
  invalidateSchemaCache(): void {
    this.schemaCache = null;
    this.schemaCacheTimestamp = 0;
  }
}

// Export singleton instance
export const neo4jService = new Neo4jService();

// console.log(res.summary.counters.updates())
/*
{
  nodesCreated: 10,
  nodesDeleted: 0,
  relationshipsCreated: 5,
  relationshipsDeleted: 0,
  propertiesSet: 20,
  labelsAdded: 10,
  labelsRemoved: 0,
  indexesAdded: 0,
  indexesRemoved: 0,
  constraintsAdded: 0,
  constraintsRemoved: 0
}
*/
