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
