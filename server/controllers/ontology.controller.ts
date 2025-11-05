import { Request, Response } from 'express';
import { neo4jService } from '../services/neo4j.service.js';

/**
 * GET /api/ontology/nodes
 * Get all nodes from the graph
 */
export async function getNodes(_req: Request, res: Response): Promise<void> {
  try {
    const cypher = `
      MATCH (n)
      RETURN n, labels(n) as labels
      LIMIT 100
    `;

    const results = await neo4jService.executeRead(cypher);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/ontology/relationships
 * Get all relationships from the graph
 */
export async function getRelationships(_req: Request, res: Response): Promise<void> {
  try {
    const cypher = `
      MATCH (a)-[r]->(b)
      RETURN a, r, b, type(r) as relationshipType
      LIMIT 100
    `;

    const results = await neo4jService.executeRead(cypher);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/ontology/graph
 * Get a complete graph structure with nodes and relationships
 */
export async function getGraph(_req: Request, res: Response): Promise<void> {
  try {
    const cypher = `
      MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT 500
    `;

    const results = await neo4jService.executeRead(cypher);

    // Transform Neo4j results into a graph structure
    const nodes = new Map();
    const relationships: any[] = [];

    results.forEach((record: any) => {
      const { n, r, m } = record;

      if (n && !nodes.has(n.identity.toString())) {
        nodes.set(n.identity.toString(), {
          id: n.identity.toString(),
          labels: n.labels,
          properties: n.properties,
        });
      }

      if (m && !nodes.has(m.identity.toString())) {
        nodes.set(m.identity.toString(), {
          id: m.identity.toString(),
          labels: m.labels,
          properties: m.properties,
        });
      }

      if (r) {
        relationships.push({
          id: r.identity.toString(),
          type: r.type,
          source: r.start.toString(),
          target: r.end.toString(),
          properties: r.properties,
        });
      }
    });

    res.json({
      success: true,
      data: {
        nodes: Array.from(nodes.values()),
        relationships,
      },
    });
  } catch (error) {
    console.error('Error fetching graph:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/ontology/query
 * Execute a custom Cypher query
 */
export async function executeQuery(req: Request, res: Response): Promise<void> {
  try {
    const { cypher, params = {} } = req.body;

    if (!cypher) {
      res.status(400).json({
        success: false,
        error: 'Cypher query is required',
      });
      return;
    }

    const results = await neo4jService.executeRead(cypher, params);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/ontology/nodes
 * Create a new node
 */
export async function createNode(req: Request, res: Response): Promise<void> {
  try {
    const { label, properties = {} } = req.body;

    if (!label) {
      res.status(400).json({
        success: false,
        error: 'Label is required',
      });
      return;
    }

    const cypher = `
      CREATE (n:${label} $properties)
      RETURN n
    `;

    const results = await neo4jService.executeWrite(cypher, { properties });

    res.status(201).json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
