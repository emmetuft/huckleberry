export interface DomoUser {
  id: number;
  displayName: string;
  role: string;
  roleId: number;
  detail: { email: string };
}

export interface DomoUserAttribute {
  key: string;
  values: (number | string)[];
}

export interface DomoGroupListItem {
  groupId: number;
  groupType: string;
  name: string;
  description: string;
  memberCount: number;
  owners: { id: string; displayName: string; type: string }[];
  created: string;
}

export interface DomoGroup {
  id: number;
  name: string;
  type: string;
  userIds: number[];
  creatorId: number;
  memberCount: number;
  guid: string;
  description: string;
  hidden: boolean;
  default: boolean;
  active: boolean;
}
