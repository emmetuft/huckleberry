import { Request, Response } from 'express';
import { contextBuilderService } from '../services/contextBuilder.service.js';
import { UserRequest } from '../../shared/models/interfaces/userRequest.ts';

/**
 * POST /api/context-builder/query
 * Build context using multiple strategies and get a complete response
 * Body:
 *   - userInput (required) - the user's question/input
 *   - userId (optional) - the user's ID for personalized context
 *   - tools (optional) - array of tools available
 *   - files (optional) - array of files to consider
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

    const result = await contextBuilderService.query(userRequest);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error processing context builder query:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/context-builder/query-stream
 * Build context using multiple strategies and stream the response
 * Body:
 *   - userInput (required) - the user's question/input
 *   - userId (optional) - the user's ID for personalized context
 *   - tools (optional) - array of tools available
 *   - files (optional) - array of files to consider
 */
export async function queryStream(req: Request, res: Response): Promise<void> {
  try {
    const userRequest: UserRequest = req.body;

    if (!userRequest.userInput) {
      res.status(400).json({
        success: false,
        error: 'User input is required',
      });
      return;
    }

    const result = await contextBuilderService.queryStream(userRequest);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send context first as metadata
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
    console.error('Error processing context builder stream query:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
