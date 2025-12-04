import { Router } from 'express';
import * as ontologyController from '../controllers/ontology.controller.js';

export const router = Router();

// GET routes
router.get('/labels', ontologyController.getLabels);
router.get('/node/:id/neighbors', ontologyController.getNeighbors);
router.get('/subgraph/:id', ontologyController.getSubgraph);
router.get('/path', ontologyController.getShortestPath);
router.get('/search', ontologyController.searchNodes);

// POST routes
router.post('/nodes', ontologyController.getNodes);
router.post('/query', ontologyController.executeQuery);
router.post('/node', ontologyController.createNode);
