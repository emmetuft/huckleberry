import { Request, Response } from 'express';
import { graphRagService } from '../services/graphRag.service.js';
import { UserRequest } from '../../shared/models/interfaces/userRequest.ts';

/**
 * POST /api/graph-rag/query
 * Query the graph using RAG and get a complete response
 * Body:
 *   - question (required) - the question to ask
 *   - labels (optional) - array of node labels to focus on
 *   - maxNodes (optional) - maximum nodes to retrieve (default: 50)
 *   - depth (optional) - relationship depth to traverse (default: 2)
 */
export async function query(req: Request, res: Response): Promise<void> {
  try {
    const userRequest: UserRequest = req.body;

    if (!userRequest.userInput) {
      res.status(400).json({
        success: false,
        error: 'User input is required',
      });
      return;
    }

    const result = await graphRagService.query(userRequest);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error processing graph RAG query:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/graph-rag/query-stream
 * Query the graph using RAG and stream the response
 * Body:
 *   - question (required) - the question to ask
 *   - labels (optional) - array of node labels to focus on
 *   - maxNodes (optional) - maximum nodes to retrieve (default: 50)
 *   - depth (optional) - relationship depth to traverse (default: 2)
 */
export async function queryStream(req: Request, res: Response): Promise<void> {
  try {
    const userRequest: UserRequest = req.body;

    if (!userRequest.userInput) {
      res.status(400).json({
        success: false,
        error: 'Question is required',
      });
      return;
    }

    const result = await graphRagService.queryStream(userRequest);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send context and query first as metadata
    res.write(
      `data: ${JSON.stringify({
        type: 'metadata',
        context: result.context,
      })}\n\n`,
    );

    // Stream the text response
    for await (const chunk of result.textStream) {
      res.write(
        `data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`,
      );
    }

    // Send done event
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error processing graph RAG stream query:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
