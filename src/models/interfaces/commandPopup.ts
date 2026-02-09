import { MCPToolDefinition } from '../../../shared/models/interfaces/mcpServer';
import { User, Team, MentionItem } from './mention';

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

export const teamToCommandItem = (team: Team): CommandPopupItem => ({
  id: team.id,
  name: team.name,
  description: team.description,
  groupKey: 'teams',
  groupName: 'Teams',
});

export const mentionToCommandItem = (item: MentionItem): CommandPopupItem => {
  if ('username' in item) {
    return userToCommandItem(item);
  } else {
    return teamToCommandItem(item);
  }
};

export const filterMentions = (
  items: MentionItem[],
  searchQuery: string,
): MentionItem[] => {
  const searchLower = searchQuery.toLowerCase();
  return items.filter((item) => {
    if ('username' in item) {
      return (
        item.username.toLowerCase().includes(searchLower) ||
        item.displayName?.toLowerCase().includes(searchLower)
      );
    } else {
      return item.name.toLowerCase().includes(searchLower);
    }
  });
};
