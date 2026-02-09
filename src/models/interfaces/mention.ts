export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

export type MentionItem = User | Team;

export const isUser = (item: MentionItem): item is User => {
  return 'username' in item;
};

export const isTeam = (item: MentionItem): item is Team => {
  return 'name' in item && !('username' in item);
};
