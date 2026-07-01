export interface User {
  id: number;
  displayName: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  memberCount?: number;
}

export type MentionItem = User | Group;

export const isUser = (item: MentionItem): item is User => {
  return 'displayName' in item;
};

export const isGroup = (item: MentionItem): item is Group => {
  return 'name' in item && !('displayName' in item);
};
