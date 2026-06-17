import { apiFetch } from 'services/headers';
import { User, Group } from 'models/interfaces/mention';
import {
  DomoGroup,
  DomoGroupListItem,
  DomoUser,
} from 'models/interfaces/people';
import { handleResponse } from 'utils/service';

const PEOPLE_API_BASE = '/api';

const getUsers = async (ids?: string[]): Promise<User[]> => {
  const response = await apiFetch(
    `${PEOPLE_API_BASE}/users${ids ? `?ids=${ids.join(',')}` : ''}`,
  );
  const data = await handleResponse<{ users: DomoUser[] }>(response);
  return data.users.map((domoUser) => ({
    id: domoUser.id,
    username: domoUser.userName,
    displayName: domoUser.displayName,
    email: domoUser.emailAddress,
  }));
};

const getGroups = async (): Promise<Group[]> => {
  const response = await apiFetch(`${PEOPLE_API_BASE}/groups`);
  const data = await handleResponse<DomoGroupListItem[]>(response);
  return data.map((domoGroup) => ({
    id: domoGroup.groupId,
    name: domoGroup.name,
    description: domoGroup.description,
    memberCount: domoGroup.memberCount,
  }));
};

const getUserById = async (id: string): Promise<User | null> => {
  const response = await apiFetch(`${PEOPLE_API_BASE}/users/${id}`);
  if (response.status === 404) return null;
  const data = await handleResponse<DomoUser>(response);
  return {
    id: data.id,
    username: data.userName,
    displayName: data.displayName,
    email: data.emailAddress,
  };
};

const getGroupById = async (id: string): Promise<Group | null> => {
  const response = await apiFetch(`${PEOPLE_API_BASE}/groups/${id}`);
  if (response.status === 404) return null;
  const data = await handleResponse<DomoGroup>(response);
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    memberCount: data.memberCount,
  };
};

export const PeopleService = {
  getUsers,
  getGroups,
  getUserById,
  getGroupById,
};
