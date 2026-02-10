import dotenv from 'dotenv';
import {
  DomoUser,
  DomoUsersResponse,
} from '../../shared/models/interfaces/domoUser.js';

dotenv.config();

const BASE_URL = process.env.DOMO_INSTANCE_URL || 'https://domo-es.domo.com';

/**
 * Users Service
 * Handles user-related API operations with Domo Identity API
 */
class UsersService {
  /**
   * Fetch all users from the Domo Identity API
   */
  async getAllUsers(): Promise<DomoUser[]> {
    const url = `${BASE_URL}/api/identity/v1/users`;

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
          `Failed to fetch users with status ${response.status}: ${errorText}`,
        );
      }

      const data = (await response.json()) as DomoUsersResponse;
      return data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific user by ID from the Domo Identity API
   */
  async getUserById(userId: string): Promise<DomoUser | null> {
    const url = `${BASE_URL}/api/identity/v1/users/${userId}`;

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
          `Failed to fetch user with status ${response.status}: ${errorText}`,
        );
      }

      const data = (await response.json()) as DomoUsersResponse;
      return data.users[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }
}

export const usersService = new UsersService();
