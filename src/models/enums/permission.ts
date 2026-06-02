import { Group, User } from 'models/interfaces/mention';

export enum Permission {
  OWNER = 'OWNER',
  EDIT = 'EDIT',
  READ = 'READ',
  NONE = 'NONE',
}

export interface AccessEntry {
  member: User | Group;
  permission: Permission;
}
