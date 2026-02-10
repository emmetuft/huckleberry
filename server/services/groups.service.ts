import dotenv from 'dotenv';
import { DomoGroup } from '../../shared/models/interfaces/domoGroup.js';

dotenv.config();

const BASE_URL = process.env.DOMO_INSTANCE_URL || 'https://domo-es.domo.com';

/**
 * Groups Service
 * Handles group-related API operations with Domo Content API
 */
class GroupsService {
  /**
   * Fetch all groups from the Domo Content API
   */
  async getAllGroups(): Promise<DomoGroup[]> {
    const url = `${BASE_URL}/api/content/v2/groups`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-DOMO-Developer-Token': process.env.DEV_TOKEN || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch groups with status ${response.status}: ${errorText}`,
        );
      }

      const groups = (await response.json()) as DomoGroup[];
      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific group by ID from the Domo Content API
   */
  async getGroupById(groupId: string): Promise<DomoGroup | null> {
    const url = `${BASE_URL}/api/content/v2/groups/${groupId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-DOMO-Developer-Token': process.env.DEV_TOKEN || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch group with status ${response.status}: ${errorText}`,
        );
      }

      const group = (await response.json()) as DomoGroup;
      return group;
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      throw error;
    }
  }
}

export const groupsService = new GroupsService();
