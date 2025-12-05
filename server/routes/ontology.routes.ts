import { Router } from 'express';
import * as ontologyController from '../controllers/ontology.controller.js';

export const router = Router();

// GET routes
router.get('/labels', ontologyController.getLabels);
router.get('/property-values/:label/:property', ontologyController.getPropertyValues);
router.get('/subgraph/:id', ontologyController.getSubgraph);
router.get('/search', ontologyController.searchNodes);

// POST routes
router.post('/nodes', ontologyController.getNodes);
router.post('/node', ontologyController.createNode);
