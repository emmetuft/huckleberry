import { Router } from 'express';
import * as groupsController from '../controllers/groups.controller.js';

export const router = Router();

// GET route - fetch all groups
router.get('/', groupsController.getAllGroups);

// GET route - fetch group by ID
router.get('/:groupId', groupsController.getGroupById);
