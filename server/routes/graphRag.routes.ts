import { Router } from 'express';
import * as graphRagController from '../controllers/graphRag.controller.js';

export const router = Router();

// POST routes
router.post('/query', graphRagController.query);
router.post('/query-stream', graphRagController.queryStream);
