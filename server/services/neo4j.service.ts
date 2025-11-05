import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

class Neo4jService {
  private driver: Driver | null = null;
  private readonly uri: string;
  private readonly username: string;
  private readonly password: string;

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
        neo4j.auth.basic(this.username, this.password)
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
    return this.driver.session({ database: process.env.NEO4J_DATABASE });
  }

  /**
   * Get a write session
   */
  getWriteSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session({ database: process.env.NEO4J_DATABASE });
  }

  /**
   * Execute a read query
   */
  async executeRead<T = any>(
    cypher: string,
    params: Record<string, any> = {}
  ): Promise<T[]> {
    const session = this.getReadSession();
    try {
      const result = await session.run(cypher, params);
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  /**
   * Execute a write query
   */
  async executeWrite<T = any>(
    cypher: string,
    params: Record<string, any> = {}
  ): Promise<T[]> {
    const session = this.getWriteSession();
    try {
      const result = await session.run(cypher, params);
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
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
}

// Export singleton instance
export const neo4jService = new Neo4jService();
