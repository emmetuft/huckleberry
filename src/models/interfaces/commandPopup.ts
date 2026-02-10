import { MCPToolDefinition } from '../../../shared/models/interfaces/mcpServer';
import { User, Group, MentionItem } from './mention';

export interface CommandPopupItem {
  id: string;
  name: string;
  description?: string;
  groupKey?: string;
  groupName?: string;
}

// Conversion utilities
export const toolToCommandItem = (
  tool: MCPToolDefinition,
): CommandPopupItem => ({
  id: `${tool.serverId}-${tool.name}`,
  name: tool.name,
  description: tool.description,
  groupKey: tool.serverId,
  groupName: tool.serverName || tool.serverId,
});

export const userToCommandItem = (user: User): CommandPopupItem => ({
  id: user.id,
  name: user.displayName || user.username,
  description: `@${user.username}`,
  groupKey: 'users',
  groupName: 'Users',
});

export const groupToCommandItem = (group: Group): CommandPopupItem => ({
  id: group.id,
  name: group.name,
  description: group.description,
  groupKey: 'groups',
  groupName: 'Groups',
});

export const mentionToCommandItem = (item: MentionItem): CommandPopupItem => {
  if ('username' in item) {
    return userToCommandItem(item);
  } else {
    return groupToCommandItem(item);
  }
};
