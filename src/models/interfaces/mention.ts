export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

export type MentionItem = User | Group;

export const isUser = (item: MentionItem): item is User => {
  return 'username' in item;
};

export const isGroup = (item: MentionItem): item is Group => {
  return 'name' in item && !('username' in item);
};
