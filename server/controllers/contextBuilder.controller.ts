import { Request, Response } from 'express';
import { contextBuilderService } from '../services/contextBuilder.service.js';
import { fileService } from '../services/file.service.js';
import { UserRequest } from '../../shared/models/interfaces/userRequest.ts';

/**
 * Validate and filter files in the user request
 * Updates the request in place with only valid files
 */
function validateAndFilterRequestFiles(userRequest: UserRequest): void {
  if (userRequest.files && userRequest.files.length > 0) {
    const { validFiles, warnings } = fileService.validateAndFilterFiles(
      userRequest.files,
    );

    // Log warnings for filtered files
    if (warnings.length > 0) {
      console.warn('File validation warnings:', warnings);
    }

    // Update request with only valid files
    userRequest.files = validFiles;
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

    validateAndFilterRequestFiles(userRequest);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Create event emitter function
    const emitEvent = (event: any) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    // Call queryStream with the event emitter
    const result = await contextBuilderService.queryStream(
      userRequest,
      emitEvent,
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
