import { Request, Response } from 'express';
import { groupsService } from '../services/groups.service.js';

/**
 * GET /api/groups
 * Fetch all groups from Domo Content API
 */
export async function getAllGroups(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const groups = await groupsService.getAllGroups();

    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/groups/:groupId
 * Fetch a specific group by ID from Domo Content API
 */
export async function getGroupById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      res.status(400).json({
        success: false,
        error: 'Group ID is required',
      });
      return;
    }

    const group = await groupsService.getGroupById(groupId);

    if (!group) {
      res.status(404).json({
        success: false,
        error: 'Group not found',
      });
      return;
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('Error fetching group by ID:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
