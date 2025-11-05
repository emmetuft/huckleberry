import { Router } from 'express';
import * as ontologyController from '../controllers/ontology.controller.js';

export const router = Router();

// GET routes
router.get('/nodes', ontologyController.getNodes);
router.get('/relationships', ontologyController.getRelationships);
router.get('/graph', ontologyController.getGraph);

// POST routes
router.post('/query', ontologyController.executeQuery);
router.post('/nodes', ontologyController.createNode);
