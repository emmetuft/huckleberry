import { User, Group, MentionItem, isUser } from './mention';
import { Tool } from './toolkit';

export interface CommandPopupItem {
  id: string;
  name: string;
  description?: string;
  groupKey?: string;
  groupName?: string;
}

// Conversion utilities
export const toolToCommandItem = (tool: Tool): CommandPopupItem => ({
  id: tool.toolId,
  name: tool.overrideToolName,
  description: tool.overrideToolDescription,
});

export const userToCommandItem = (user: User): CommandPopupItem => ({
  id: user.id.toString(),
  name: user.displayName,
  description: `@${user.displayName}`,
  groupKey: 'users',
  groupName: 'Users',
});

export const groupToCommandItem = (group: Group): CommandPopupItem => ({
  id: group.id.toString(),
  name: group.name,
  description: group.description,
  groupKey: 'groups',
  groupName: 'Groups',
});

export const mentionToCommandItem = (item: MentionItem): CommandPopupItem => {
  if (isUser(item)) {
    return userToCommandItem(item);
  } else {
    return groupToCommandItem(item);
  }
};
