import { User, Group } from 'models/interfaces/mention';
import { DomoUser } from '../../shared/models/interfaces/domoUser';
import { DomoGroup } from '../../shared/models/interfaces/domoGroup';

const API_BASE_URL = '/api';

export class PeopleService {
  static async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const result = (await response.json()) as {
        success: boolean;
        data: DomoUser[];
      };

      if (!result.success) {
        throw new Error('Failed to fetch users');
      }

      // Transform DomoUser to User interface
      return result.data.map((domoUser) => ({
        id: domoUser.id.toString(),
        username: domoUser.userName,
        displayName: domoUser.displayName,
        email: domoUser.emailAddress,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getGroups(): Promise<Group[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`);

      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }

      const result = (await response.json()) as {
        success: boolean;
        data: DomoGroup[];
      };

      if (!result.success) {
        throw new Error('Failed to fetch groups');
      }

      // Transform DomoGroup to Group interface
      return result.data.map((domoGroup) => ({
        id: domoGroup.id.toString(),
        name: domoGroup.name,
        description: domoGroup.description,
        memberCount: domoGroup.memberCount,
      }));
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const result = (await response.json()) as {
        success: boolean;
        data: DomoUser;
      };

      if (!result.success) {
        return null;
      }

      // Transform DomoUser to User interface
      return {
        id: result.data.id.toString(),
        username: result.data.userName,
        displayName: result.data.displayName,
        email: result.data.emailAddress,
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  static async getGroupById(id: string): Promise<Group | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch group: ${response.status}`);
      }

      const result = (await response.json()) as {
        success: boolean;
        data: DomoGroup;
      };

      if (!result.success) {
        return null;
      }

      // Transform DomoGroup to Group interface
      return {
        id: result.data.id.toString(),
        name: result.data.name,
        description: result.data.description,
        memberCount: result.data.memberCount,
      };
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      return null;
    }
  }
}
