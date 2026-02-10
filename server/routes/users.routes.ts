import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';

export const router = Router();

// GET route - fetch all users
router.get('/', usersController.getAllUsers);

// GET route - fetch user by ID
router.get('/:userId', usersController.getUserById);
