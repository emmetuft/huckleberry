import { Request, Response } from 'express';
import neo4j from 'neo4j-driver';
import { neo4jService } from '../services/neo4j.service.js';
import {
  parseResponseData,
  buildLabelFilterConditions,
} from '../utils/neo4j.ts';
import { FilterCondition } from '../../shared/models/interfaces/filters.js';

/**
 * GET /api/ontology/labels
 * Get all node labels from the graph
 */
export async function getLabels(_req: Request, res: Response): Promise<void> {
  try {
    const cypher = `
      CALL db.labels()
      YIELD label
      RETURN label
      ORDER BY label;
    `;

    const results = await neo4jService.executeRead(cypher);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching node labels:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/ontology/property-values/:label/:property
 * Get unique values for a given property on nodes with a specific label
 * Params:
 *   - label - the node label to query
 *   - property - the property name to get values for
 * Query:
 *   - limit (optional) - limit number of results (default: 50)
 */
export async function getPropertyValues(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { label, property } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    if (!label || !property) {
      res.status(400).json({
        success: false,
        error: 'Label and property are required',
      });
      return;
    }

    const cypher = `
      MATCH (n:\`${label}\`)
      WHERE n.\`${property}\` IS NOT NULL
      RETURN DISTINCT n.\`${property}\` AS value
      ORDER BY value
      LIMIT $limit
    `;

    const results = await neo4jService.executeRead(cypher, {
      limit: neo4j.int(limit),
    });

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching property values:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/ontology/nodes
 * Get all nodes from the graph, optionally filtered by label and properties
 * Body:
 *   - labels (optional) - array of labels to filter by
 *   - filters (optional) - array of property filters
 *   - includeRelationships (optional) - if true, also fetch relationships between nodes (default: true)
 *   - limit (optional) - limit number of results (default: 3000)
 */
export async function getNodes(req: Request, res: Response): Promise<void> {
  try {
    const {
      labels = [],
      filters = [],
      includeRelationships = true,
      limit = 3000,
    } = req.body;

    let cypher: string;
    let params: any = { limit: neo4j.int(limit) };

    // Build WHERE clause that applies property filters to specific labels
    const whereConditions = buildLabelFilterConditions(
      labels,
      filters as FilterCondition[],
      params,
    );

    if (whereConditions && includeRelationships) {
      // Fetch nodes and relationships between them
      cypher = `
        MATCH (n)
        WHERE ${whereConditions}
        WITH COLLECT(DISTINCT n) AS nodes
        UNWIND nodes AS n
        OPTIONAL MATCH (n)-[r]-(m)
        WHERE m IN nodes
        RETURN DISTINCT n, r, m
        LIMIT $limit
      `;
    } else if (whereConditions) {
      // Fetch only nodes without relationships
      cypher = `
        MATCH (n)
        WHERE ${whereConditions}
        RETURN n
        LIMIT $limit
      `;
    } else {
      // Get all nodes (no label or filter constraints)
      cypher = `
        MATCH (n)
        RETURN n
        LIMIT $limit
      `;
    }

    const results = await neo4jService.executeRead(cypher, params);
    const { nodes, relationships } = parseResponseData(results);

    res.json({
      success: true,
      data: {
        nodes,
        relationships,
      },
      count: nodes.length,
    });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getSubgraph(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const depth = parseInt(req.query.depth as string) || 2;
    const limit = parseInt(req.query.limit as string) || 500;

    const cypher = `
      MATCH (start)
      WHERE id(start) = $id
      MATCH (start)-[r*1..${depth}]-(m)
      RETURN DISTINCT start, m, r
      LIMIT $limit
    `;

    const results = await neo4jService.executeRead(cypher, {
      id: neo4j.int(id),
      limit: neo4j.int(limit),
    });
    const { nodes, relationships } = parseResponseData(results);

    res.json({
      success: true,
      data: {
        nodes,
        relationships,
      },
    });
  } catch (error) {
    console.error('Error fetching subgraph:', error);
    res.status(500).json({ success: false, error: error });
  }
}

export async function searchNodes(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
      res.status(400).json({ success: false, error: 'Query string required' });
      return;
    }

    const cypher = `
        MATCH (n)
        WHERE toLower(toString(n.name)) CONTAINS toLower($query)
        WITH COLLECT(DISTINCT n) AS nodes
        UNWIND nodes AS n
        OPTIONAL MATCH (n)-[r]-(m)
        WHERE m IN nodes
        RETURN DISTINCT n, r, m
        LIMIT $limit
    `;

    const results = await neo4jService.executeRead(cypher, {
      query,
      limit: neo4j.int(limit),
    });
    const { nodes, relationships } = parseResponseData(results);

    res.json({
      success: true,
      data: {
        nodes,
        relationships,
      },
    });
  } catch (error) {
    console.error('Error searching nodes:', error);
    res.status(500).json({ success: false, error: error });
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
