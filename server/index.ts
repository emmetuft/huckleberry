import express, { Express, Request, Response, NextFunction } from 'express';
import { neo4jService } from './services/neo4j.service.js';
import { router as ontologyRouter } from './routes/ontology.routes.js';
import { router as graphRagRouter } from './routes/graphRag.routes.js';

export async function setupServer(app: Express): Promise<void> {
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Neo4j connection
  try {
    await neo4jService.connect();
  } catch (error) {
    console.error('Failed to initialize Neo4j:', error);
    // Continue even if Neo4j fails to connect for development
  }

  // API Routes
  app.use('/api/ontology', ontologyRouter);
  app.use('/api/graph-rag', graphRagRouter);

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    await neo4jService.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
