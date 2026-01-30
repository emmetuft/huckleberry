import { Router } from 'express';
import * as personaController from '../controllers/persona.controller.js';

export const router = Router();

// GET route - fetch user persona
router.get('/:userId', personaController.getUserPersona);

// POST route - save (create or update) user persona
router.post('/:userId', personaController.saveUserPersona);
