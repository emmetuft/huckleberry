import { Request, Response } from 'express';
import { personaService } from '../services/persona.service.js';
import { Persona } from '../../shared/models/interfaces/persona.ts';

/**
 * GET /api/persona/:userId
 * Fetch user persona by userId
 */
export async function getUserPersona(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    const persona = await personaService.getUserPersona(userId.toString());

    res.json({
      success: true,
      data: persona,
    });
  } catch (error) {
    console.error('Error fetching user persona:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/persona/:userId
 * Save (create or update) user persona
 * Body: Persona object
 */
export async function saveUserPersona(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req.params;
    const persona: Persona = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    if (!persona) {
      res.status(400).json({
        success: false,
        error: 'Persona data is required',
      });
      return;
    }

    const savedPersona = await personaService.saveUserPersona(userId, persona);

    res.json({
      success: true,
      data: savedPersona,
    });
  } catch (error) {
    console.error('Error saving user persona:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
