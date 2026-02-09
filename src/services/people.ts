import { User, Team } from 'models/interfaces/mention';

// Mock data - TODO: Replace with real API calls
const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    displayName: 'John Doe',
    email: 'john@example.com',
  },
  {
    id: '2',
    username: 'janesmith',
    displayName: 'Jane Smith',
    email: 'jane@example.com',
  },
  {
    id: '3',
    username: 'bobwilson',
    displayName: 'Bob Wilson',
    email: 'bob@example.com',
  },
  {
    id: '4',
    username: 'alicejohnson',
    displayName: 'Alice Johnson',
    email: 'alice@example.com',
  },
  {
    id: '5',
    username: 'charlielee',
    displayName: 'Charlie Lee',
    email: 'charlie@example.com',
  },
];

const mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Engineering',
    description: 'Software engineering team',
    memberCount: 15,
  },
  {
    id: 't2',
    name: 'Design',
    description: 'Product design team',
    memberCount: 8,
  },
  {
    id: 't3',
    name: 'Marketing',
    description: 'Marketing team',
    memberCount: 10,
  },
  {
    id: 't4',
    name: 'Sales',
    description: 'Sales team',
    memberCount: 12,
  },
  {
    id: 't5',
    name: 'Support',
    description: 'Customer support team',
    memberCount: 6,
  },
];

export class PeopleService {
  static async getUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockUsers;
  }

  static async getTeams(): Promise<Team[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockTeams;
  }

  static async getUserById(id: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockUsers.find((user) => user.id === id) || null;
  }

  static async getTeamById(id: string): Promise<Team | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockTeams.find((team) => team.id === id) || null;
  }
}
