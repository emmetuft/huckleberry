import { Request, Response } from 'express';
import { usersService } from '../services/users.service.js';

/**
 * GET /api/users
 * Fetch all users from Domo Identity API
 */
export async function getAllUsers(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const users = await usersService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/users/:userId
 * Fetch a specific user by ID from Domo Identity API
 */
export async function getUserById(
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

    const user = await usersService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
