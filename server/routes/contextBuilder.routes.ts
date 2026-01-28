import { Router } from 'express';
import * as contextBuilderController from '../controllers/contextBuilder.controller.js';

export const router = Router();

// POST routes
router.post('/query', contextBuilderController.query);
router.post('/query-stream', contextBuilderController.queryStream);
